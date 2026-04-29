from collections import defaultdict
from datetime import UTC, datetime, timedelta

from repositories.base_repository import BaseRepository
from utils.datetime_utils import now_utc
from utils.errors import ApiError


class ReportService:
    def __init__(self):
        self.bookings_repo = BaseRepository("bookings")
        self.showtimes_repo = BaseRepository("showtimes")
        self.movies_repo = BaseRepository("movies")
        self.cinemas_repo = BaseRepository("cinemas")

    def get_overview(self) -> dict:
        dataset = self._build_dataset()
        today = now_utc().date()
        last_7_days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
        prev_7_days_start = last_7_days[0] - timedelta(days=7)
        prev_7_days_end = last_7_days[0] - timedelta(days=1)

        revenue_by_day = defaultdict(int)
        tickets_by_day = defaultdict(int)
        total_revenue = 0
        total_tickets = 0
        prev_revenue = 0
        prev_tickets = 0
        
        occupancy_sum = 0.0
        occupancy_count = 0

        movie_acc = defaultdict(lambda: {"tickets": 0, "revenue": 0})
        cinema_acc = defaultdict(lambda: {"tickets": 0, "capacity": 0})

        for item in dataset:
            show_date = item["showtime_start"].date()
            if last_7_days[0] <= show_date <= last_7_days[-1]:
                revenue_by_day[show_date] += item["total_price"]
                tickets_by_day[show_date] += item["ticket_count"]
                total_revenue += item["total_price"]
                total_tickets += item["ticket_count"]
            elif prev_7_days_start <= show_date <= prev_7_days_end:
                prev_revenue += item["total_price"]
                prev_tickets += item["ticket_count"]

            if item["capacity"] > 0:
                occupancy = (item["ticket_count"] / item["capacity"]) * 100
                occupancy_sum += occupancy
                occupancy_count += 1

            movie_key = item["movie_title"]
            movie_acc[movie_key]["tickets"] += item["ticket_count"]
            movie_acc[movie_key]["revenue"] += item["total_price"]

            cinema_key = item["cinema_name"]
            cinema_acc[cinema_key]["tickets"] += item["ticket_count"]
            cinema_acc[cinema_key]["capacity"] += item["capacity"]

        revenue_series = [
            {
                "day": date_item.strftime("%d/%m"),
                "revenue": revenue_by_day[date_item],
                "tickets": tickets_by_day[date_item],
            }
            for date_item in last_7_days
        ]

        revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0
        tickets_growth = ((total_tickets - prev_tickets) / prev_tickets * 100) if prev_tickets else 0
        total_customers = BaseRepository("users").collection.count_documents({"role": "KHACHHANG"})

        avg_occupancy = round(occupancy_sum / occupancy_count, 1) if occupancy_count else 0

        return {
            "summary": {
                "totalRevenue": {
                    "value": total_revenue,
                    "growth": round(revenue_growth, 1)
                },
                "totalTickets": {
                    "value": total_tickets,
                    "growth": round(tickets_growth, 1)
                },
                "totalCustomers": total_customers,
                "avgOccupancy": avg_occupancy
            },
            "kpis": {
                "totalRevenue": total_revenue,
                "totalTickets": total_tickets,
                "averageOccupancy": avg_occupancy,
            },
            "revenueSeries": revenue_series,
        }

    def get_staff_summary(self) -> dict:
        dataset = self._build_dataset()
        today = now_utc().date()
        
        today_tickets = 0
        today_revenue = 0
        remaining_showtimes = 0
        active_movies = set()
        
        now = now_utc()
        
        for item in dataset:
            show_date = item["showtime_start"].date()
            if show_date == today:
                today_tickets += item["ticket_count"]
                today_revenue += item["total_price"]
                
            if item["showtime_start"] > now:
                remaining_showtimes += 1
                active_movies.add(item["movie_title"])
                
        return {
            "todayTickets": today_tickets,
            "todayRevenue": today_revenue,
            "remainingShowtimes": remaining_showtimes,
            "activeMovies": len(active_movies)
        }

    def get_revenue_report(self, view: str, start_date: str | None = None, end_date: str | None = None) -> dict:
        normalized_view = (view or "weekly").lower()
        dataset = self._filter_dataset_by_date(self._build_dataset(), start_date, end_date)
        grouped = defaultdict(lambda: {"revenue": 0, "tickets": 0})

        for item in dataset:
            dt = item["showtime_start"]
            if normalized_view == "monthly":
                key = dt.strftime("%Y-%m")
            else:
                iso_year, iso_week, _ = dt.isocalendar()
                key = f"{iso_year}-W{iso_week:02d}"
            grouped[key]["revenue"] += item["total_price"]
            grouped[key]["tickets"] += item["ticket_count"]

        keys = sorted(grouped.keys())
        series = []
        table = []
        prev_revenue = 0
        for key in keys:
            revenue = grouped[key]["revenue"]
            tickets = grouped[key]["tickets"]
            avg_price = round(revenue / tickets) if tickets else 0
            growth = ((revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0
            series.append(
                {
                    "label": key,
                    "revenue": revenue,
                    "tickets": tickets,
                    "prevRevenue": prev_revenue,
                }
            )
            table.append(
                {
                    "period": key,
                    "revenue": revenue,
                    "tickets": tickets,
                    "avgPrice": avg_price,
                    "growthPercent": round(growth, 1),
                }
            )
            prev_revenue = revenue

        total_revenue = sum(item["revenue"] for item in series)
        total_tickets = sum(item["tickets"] for item in series)
        return {
            "view": normalized_view,
            "series": series,
            "table": table,
            "summary": {
                "totalRevenue": total_revenue,
                "totalTickets": total_tickets,
                "averagePrice": round(total_revenue / total_tickets) if total_tickets else 0,
            },
        }

    def get_movie_report(self, start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        dataset = self._filter_dataset_by_date(self._build_dataset(), start_date, end_date)
        movies = defaultdict(lambda: {"tickets": 0, "revenue": 0, "capacity": 0, "genre": "N/A", "rating": 0.0})

        for item in dataset:
            key = item["movie_title"]
            movies[key]["tickets"] += item["ticket_count"]
            movies[key]["revenue"] += item["total_price"]
            movies[key]["capacity"] += item["capacity"]
            movies[key]["genre"] = item["movie_genre"]
            movies[key]["rating"] = item["movie_rating"]

        rows = []
        for title, values in movies.items():
            occupancy = round((values["tickets"] / values["capacity"]) * 100) if values["capacity"] else 0
            rows.append(
                {
                    "title": title,
                    "genre": values["genre"],
                    "tickets": values["tickets"],
                    "revenue": values["revenue"],
                    "rating": values["rating"],
                    "occupancy": occupancy,
                }
            )
        rows.sort(key=lambda row: row["tickets"], reverse=True)
        for idx, row in enumerate(rows, start=1):
            row["rank"] = idx
        return rows

    def get_cinema_report(self, start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        dataset = self._filter_dataset_by_date(self._build_dataset(), start_date, end_date)
        cinemas = defaultdict(
            lambda: {"city": "N/A", "revenue": 0, "tickets": 0, "capacity": 0, "rooms": defaultdict(lambda: {"tickets": 0, "capacity": 0})}
        )

        for item in dataset:
            key = item["cinema_id"]
            cinemas[key]["city"] = item["cinema_city"]
            cinemas[key]["revenue"] += item["total_price"]
            cinemas[key]["tickets"] += item["ticket_count"]
            cinemas[key]["capacity"] += item["capacity"]
            room_key = item["room_name"]
            cinemas[key]["rooms"][room_key]["tickets"] += item["ticket_count"]
            cinemas[key]["rooms"][room_key]["capacity"] += item["capacity"]

        result = []
        for cinema_id, values in cinemas.items():
            room_rows = []
            for room_name, room_values in values["rooms"].items():
                room_occupancy = round((room_values["tickets"] / room_values["capacity"]) * 100) if room_values["capacity"] else 0
                room_rows.append({"room": room_name, "occupancy": room_occupancy})
            room_rows.sort(key=lambda row: row["room"])
            occupancy = round((values["tickets"] / values["capacity"]) * 100) if values["capacity"] else 0
            result.append(
                {
                    "id": str(cinema_id),
                    "name": self._cinema_name_lookup.get(cinema_id, "N/A"),
                    "city": values["city"],
                    "rooms": len(room_rows),
                    "seats": self._cinema_total_seats_lookup.get(cinema_id, 0),
                    "revenue": values["revenue"],
                    "tickets": values["tickets"],
                    "occupancy": occupancy,
                    "roomData": room_rows,
                }
            )
        result.sort(key=lambda row: row["tickets"], reverse=True)
        return result

    def _build_dataset(self) -> list[dict]:
        bookings = self.bookings_repo.find_many()
        showtimes = {row["_id"]: row for row in self.showtimes_repo.find_many()}
        movies = {row["_id"]: row for row in self.movies_repo.find_many()}
        cinemas = self.cinemas_repo.find_many()

        self._cinema_name_lookup = {}
        self._cinema_total_seats_lookup = {}
        room_lookup = {}
        for cinema in cinemas:
            self._cinema_name_lookup[cinema["_id"]] = cinema.get("name", "N/A")
            total_seats = 0
            for room in cinema.get("rooms", []):
                total = int(room.get("totalSeats", 0) or 0)
                total_seats += total
                room_lookup[(cinema["_id"], room.get("_id"))] = {"name": room.get("name", "N/A"), "totalSeats": total}
            self._cinema_total_seats_lookup[cinema["_id"]] = total_seats

        rows = []
        for booking in bookings:
            showtime = showtimes.get(booking.get("showtimeId"))
            if not showtime:
                continue
            movie = movies.get(showtime.get("movieId"), {})
            room = room_lookup.get((showtime.get("cinemaId"), showtime.get("roomId")), {})
            ticket_count = len(booking.get("tickets", []))
            start_time = showtime.get("startTime")
            if not isinstance(start_time, datetime):
                continue
            if start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=UTC)

            genres = movie.get("genres", [])
            genre = genres[0] if genres else "N/A"

            rows.append(
                {
                    "cinema_id": showtime.get("cinemaId"),
                    "cinema_name": self._cinema_name_lookup.get(showtime.get("cinemaId"), "N/A"),
                    "cinema_city": self._cinema_city(showtime.get("cinemaId"), cinemas),
                    "room_name": room.get("name", "N/A"),
                    "capacity": room.get("totalSeats", 0),
                    "movie_title": movie.get("title", "N/A"),
                    "movie_genre": genre,
                    "movie_rating": float(movie.get("rating", 0) or 0),
                    "ticket_count": ticket_count,
                    "total_price": int(booking.get("totalPrice", 0) or 0),
                    "showtime_start": start_time,
                }
            )
        return rows

    @staticmethod
    def _cinema_city(cinema_id, cinemas: list[dict]) -> str:
        for cinema in cinemas:
            if cinema.get("_id") == cinema_id:
                return cinema.get("city", "N/A")
        return "N/A"

    @staticmethod
    def _filter_dataset_by_date(dataset: list[dict], start_date: str | None, end_date: str | None) -> list[dict]:
        if not start_date and not end_date:
            return dataset

        try:
            start_dt = datetime.fromisoformat(start_date).date() if start_date else None
            end_dt = datetime.fromisoformat(end_date).date() if end_date else None
        except ValueError as exc:
            raise ApiError("startDate/endDate must be in YYYY-MM-DD format", 400) from exc
        if start_dt and end_dt and start_dt > end_dt:
            raise ApiError("startDate must be <= endDate", 400)
        filtered: list[dict] = []
        for item in dataset:
            show_date = item["showtime_start"].date()
            if start_dt and show_date < start_dt:
                continue
            if end_dt and show_date > end_dt:
                continue
            filtered.append(item)
        return filtered
