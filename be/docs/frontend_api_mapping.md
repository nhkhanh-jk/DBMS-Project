# Hướng Dẫn API Mapping Cho Frontend Engineer

Tài liệu này giúp FE chuyển từ các endpoint cũ sang endpoint theo `api-require.md`.

## 1) Quy ước chung

- Base URL: `/api`
- Auth header: `Authorization: Bearer <token>`
- Backend đang hỗ trợ song song key English và legacy Vietnamese.
- FE nên ưu tiên key English để giảm nợ kỹ thuật.

## 2) Mapping theo module

## Auth & User

| Màn hình/Use case FE | Endpoint FE nên dùng | Endpoint cũ tương đương | Ghi chú cập nhật |
| --- | --- | --- | --- |
| Đăng ký | `POST /api/auth/register` | giữ nguyên | Body tối thiểu: `fullName`, `email`, `phone`, `password` (backend tự sinh `username` nếu thiếu). |
| Đăng nhập user | `POST /api/auth/login` | giữ nguyên | Có thể gửi `email` + `password` hoặc `username` + `password`. |
| Đăng xuất | `POST /api/auth/logout` | chưa có | Gọi API để đồng bộ flow; FE vẫn cần xóa token local. |
| Lấy profile | `GET /api/users/profile` | `GET /api/auth/profile` | Chuyển sang `/api/users/profile` theo tài liệu mới. |
| Cập nhật profile | `PUT /api/users/profile` | `PATCH /api/auth/profile` | Backend hỗ trợ cả `PUT` và `PATCH`. |
| Danh sách vé đã đặt | `GET /api/users/tickets` | `GET /api/bookings/me` | Trả về tất cả vé của người dùng. `ticketState` luôn là `ACTIVE`. |

## Movies & Cinemas (Public)

| Màn hình/Use case FE | Endpoint FE nên dùng | Endpoint cũ tương đương | Ghi chú cập nhật |
| --- | --- | --- | --- |
| Danh sách phim | `GET /api/movies?status=...` | giữ nguyên | `status`: `now-showing`, `coming-soon`, `sneak-show` hoặc status hiện có của data. |
| Chi tiết phim | `GET /api/movies/:id` | giữ nguyên | Không đổi. |
| Danh sách rạp | `GET /api/cinemas` | giữ nguyên | Không đổi. |
| Chi tiết rạp | `GET /api/cinemas/:id` | mới | FE thêm call mới cho trang chi tiết rạp. |

## Showtime & Booking (Public)

| Màn hình/Use case FE | Endpoint FE nên dùng | Endpoint cũ tương đương | Ghi chú cập nhật |
| --- | --- | --- | --- |
| Lịch chiếu | `GET /api/showtimes?movieId=&cinemaId=&date=` | giữ nguyên | Không đổi query chính. |
| Sơ đồ ghế theo suất | `GET /api/showtimes/:id/seats` | `GET /api/seats/showtime/:id` | Chuyển sang path mới theo tài liệu. |
| Đặt vé online | `POST /api/bookings` | giữ nguyên | Có thể gửi `seats: ["A1","A2"]` hoặc `tickets: [{seatNumber,price}]`. |

## Admin

| Màn hình/Use case FE | Endpoint FE nên dùng | Ghi chú cập nhật |
| --- | --- | --- |
| Admin login | `POST /api/admin/auth/login` | Chỉ cho role `ADMIN`. |
| Quản lý phim | `GET/POST /api/admin/movies`, `PUT/DELETE /api/admin/movies/:id` | `GET` hỗ trợ `page`, `limit`, `search`, `status`. |
| Quản lý rạp | `GET/POST /api/admin/cinemas`, `PUT/DELETE /api/admin/cinemas/:id` | FE nên dùng endpoint này thay vì route public cho màn admin. |
| Quản lý khách hàng | `GET /api/admin/users`, `PUT /api/admin/users/:id/status` | `PATCH` vẫn hỗ trợ, nhưng FE nên chuẩn hóa `PUT`. |
| Quản lý nhân sự | `GET/POST /api/admin/staffs`, `PUT/PATCH/DELETE /api/admin/staffs/:id` | Thống nhất dùng `staffs` (plural). |

## Manager

| Màn hình/Use case FE | Endpoint FE nên dùng | Ghi chú cập nhật |
| --- | --- | --- |
| Manager login | `POST /api/manager/auth/login` | Cho role `QUANLY`. |
| Dashboard Summary | `GET /api/manager/reports/summary` | Trả về `totalRevenue`, `totalTickets` (kèm % growth), `totalCustomers`, `avgOccupancy`. |
| CRUD suất chiếu | `GET/POST /api/manager/showtimes`, `PUT/DELETE /api/manager/showtimes/:id` | `GET` hỗ trợ filter `movieId`, `cinemaId`, `date` (YYYY-MM-DD). |
| Danh sách staff | `GET /api/manager/staffs` | Lấy danh sách nhân viên để quản lý. |
| Báo cáo phim | `GET /api/manager/reports/movies?startDate=&endDate=` | Format ngày `YYYY-MM-DD`. |
| Báo cáo rạp | `GET /api/manager/reports/cinemas` | Hỗ trợ thêm `startDate/endDate`. |
| Báo cáo doanh thu | `GET /api/manager/reports/revenue` | Hỗ trợ `view=weekly|monthly` + `startDate/endDate`. |
| Import suất chiếu | `POST /api/manager/showtimes/import` | Body: CSV data (columns: `movieId`, `cinemaId`, `roomId`, `startTime`, `endTime`, `basePrice`). |
| Chi tiết nhân viên | `GET /api/manager/staffs/:id` | Xem chi tiết hiệu suất (`totalBookings`, `totalRevenue`) và lịch sử bán vé. |

## Staff

| Màn hình/Use case FE | Endpoint FE nên dùng | Ghi chú cập nhật |
| --- | --- | --- |
| Staff login | `POST /api/staff/auth/login` | Cho role `NHANVIEN`. |
| Staff Dashboard Stats | `GET /api/staff/reports/summary` | Trả về `todayTickets`, `todayRevenue`, `remainingShowtimes`, `activeMovies`. |
| Thông tin ca làm việc | `GET /api/staff/shift/info` | Thông tin ca trực hiện tại (giờ bắt đầu/kết thúc, vị trí). |
| Suất chiếu trong ngày | `GET /api/staff/showtimes/today` | Có thể truyền `cinemaId`, mặc định ngày hiện tại. |
| Sơ đồ ghế staff | `GET /api/staff/showtimes/:id/seats` | Trả về `status` (AVAILABLE/BOOKED/MAINTENANCE), `type`, và `price` (đã tính phụ phí). |
| Bán vé tại quầy | `POST /api/staff/bookings` | Body: `{ showtimeId, seats, paymentMethod, userId? }`. |
| Soát vé | `POST /api/staff/tickets/check` | Body: `{ "ticketCode": "BK-..." }`. |

## 3) Payload chuẩn FE nên dùng

## Register

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0909000000",
  "password": "123456"
}
```

## Login

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

## Create booking (public/staff)

```json
{
  "showtimeId": "<objectId>",
  "seats": ["A1", "A2"],
  "paymentMethod": "cash"
}
```

## Staff ticket check

```json
{
  "ticketCode": "BK-ABC1234567"
}
```

## 4) Migration ưu tiên cho FE

1. Chuyển toàn bộ profile/tickets sang `/api/users/*`.
2. Chuyển seat map sang `/api/showtimes/:id/seats`.
3. Với dashboard role-based, dùng đúng namespace `/api/admin/*`, `/api/manager/*`, `/api/staff/*`.
4. Chuẩn hóa request body dùng key English (`fullName`, `phoneNumber/phone`, `showtimeId`, `seats`, ...).

## 5) Lưu ý tương thích

- Backend vẫn giữ endpoint cũ để không làm gãy FE hiện tại.
- FE có thể rollout từng module, không cần đổi toàn bộ trong một lần release.
