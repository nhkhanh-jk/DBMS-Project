import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useTranslation } from "react-i18next";
import { moviesApi } from "@/services/moviesApi";
import { showtimesApi } from "@/services/showtimesApi";
import { bookingsApi } from "@/services/bookingsApi";
import { useAuth } from "@/contexts/auth-context";
import { translateGenre, translateRegion } from "@/utils/localize";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80";
const VIP_SURCHARGE = 20000;
const SWEETBOX_SURCHARGE = 40000;

const combosList = [
  { id: "1", name: "MY COMBO", desc: "1 Bắp (vị ngọt/mặn) + 1 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 85000, img: "https://www.cgv.vn/media/concession/m-combo.png" },
  { id: "2", name: "CGV COMBO", desc: "1 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 115000, img: "https://www.cgv.vn/media/concession/cgv-combo.png" },
  { id: "3", name: "COUPLE COMBO", desc: "2 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 155000, img: "https://www.cgv.vn/media/concession/couple-combo.png" },
  { id: "4", name: "PARTY COMBO", desc: "3 Bắp (vị ngọt/mặn) + 3 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 215000, img: "https://www.cgv.vn/media/concession/party-combo.png" },
];

export default function PhimChiTietPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams(); // slug here is actually movie ID
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState("schedule");
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoadingMovie(true);
      try {
        const data = await moviesApi.getMovieById(slug);
        setMovie(data);
        // Fetch showtimes for this movie
        const st = await showtimesApi.getShowtimes({ movieId: data.id });
        setShowtimes(Array.isArray(st) ? st : []);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        setLoadingMovie(false);
      }
    };
    if (slug) fetchMovie();
  }, [slug]);

  const handleSelectShowtime = async (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookingStep("seats");
    setLoadingSeats(true);
    try {
      const data = await showtimesApi.getShowtimeSeats(showtime.id);
      setSeats(Array.isArray(data) ? data : []);
    } catch {
      setSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert(t("max-8-tickets") || "Tối đa 8 ghế.");
        return;
      }
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const updateCombo = (id, delta) => {
    setSelectedCombos(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    const seatTotal = selectedSeats.reduce((sum, seatNumber) => {
      const seatData = seats.find(s => s.seatNumber === seatNumber);
      return sum + (seatData?.price || selectedShowtime?.basePrice || 100000);
    }, 0);
    const comboTotal = Object.entries(selectedCombos).reduce((sum, [id, qty]) => {
      const combo = combosList.find(c => c.id === id);
      return sum + (combo?.price || 0) * qty;
    }, 0);
    return seatTotal + comboTotal;
  };

  const handleNext = () => {
    if (bookingStep === "seats" && selectedSeats.length === 0) {
      alert(t("please-select-seat") || "Vui lòng chọn ghế.");
      return;
    }
    if (bookingStep === "seats") setBookingStep("combos");
    else if (bookingStep === "combos") setBookingStep("payment");
  };

  const handlePrevious = () => {
    if (bookingStep === "seats") setBookingStep("schedule");
    else if (bookingStep === "combos") setBookingStep("seats");
    else if (bookingStep === "payment") setBookingStep("combos");
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate("/dangnhap");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const ticketPrice = selectedShowtime?.basePrice || 100000;
      // Ghế ngồi
      const seatTickets = selectedSeats.map(seatNumber => ({
        seatNumber,
        price: ticketPrice,
        type: "seat",
      }));

      // Combo bắp/nước — thêm vào tickets dưới dạng item riêng
      const comboTickets = Object.entries(selectedCombos).flatMap(([id, qty]) => {
        if (!qty || qty <= 0) return [];
        const combo = combosList.find(c => c.id === id);
        if (!combo) return [];
        // Mỗi combo 1 đơn vị = 1 ticket riêng
        return Array.from({ length: qty }, () => ({
          seatNumber: `COMBO-${combo.name}`,
          price: combo.price,
          type: "combo",
          comboName: combo.name,
        }));
      });

      const allTickets = [...seatTickets, ...comboTickets];

      const result = await bookingsApi.createBooking({
        showtimeId: selectedShowtime.id,
        tickets: allTickets,
        paymentMethod,
      });
      setBookingSuccess(result);
      setBookingStep("success");
    } catch (err) {
      const msg = err.response?.data?.error || "Đặt vé thất bại. Vui lòng thử lại.";
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const openBooking = () => {
    if (!isAuthenticated) {
      navigate("/dangnhap");
      return;
    }
    setIsBookingOpen(true);
    setBookingStep("schedule");
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedCombos({});
    setBookingError("");
    setBookingSuccess(null);
  };

  if (loadingMovie) {
    return (
      <TNCLayout>
        <div className="flex justify-center items-center min-h-screen bg-[#fcfbf7]">
          <div className="w-10 h-10 border-4 border-[#e71a0f] border-t-transparent rounded-full animate-spin" />
        </div>
      </TNCLayout>
    );
  }

  if (!movie) {
    return (
      <TNCLayout>
        <div className="flex justify-center items-center min-h-screen bg-[#fcfbf7]">
          <p className="text-gray-500 font-medium">Không tìm thấy phim.</p>
        </div>
      </TNCLayout>
    );
  }

  // Group showtimes by cinema
  const cinemaGroups = {};
  showtimes.forEach(st => {
    const cinemaName = st.roomName || st.cinemaId || "Rạp TNC";
    if (!cinemaGroups[cinemaName]) cinemaGroups[cinemaName] = [];
    cinemaGroups[cinemaName].push(st);
  });

  const genres = Array.isArray(movie.genres) ? movie.genres.join(", ") : (movie.genres || "");

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen py-10 md:py-16 text-black">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 border-b-2 border-gray-800 pb-2">
            <h2 className="text-3xl font-black text-[#333] uppercase font-serif">{t("movie-content")}</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-[220px] flex-shrink-0 animate-in fade-in slide-in-from-left duration-700">
              <div className="p-0.5 bg-white border border-gray-300 shadow-xl">
                <img src={movie.posterUrl || movie.image || FALLBACK_IMG} alt={movie.title} className="w-full h-auto object-cover" />
              </div>
            </div>

            <div className="flex-grow space-y-6 animate-in fade-in slide-in-from-right duration-700">
              <h1 className="text-4xl font-black text-[#333] uppercase leading-tight tracking-tight">{movie.title}</h1>
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                  <span className="font-black text-[#333]">{t("genre")}:</span>
                  <span className="text-gray-700 font-bold">{translateGenre(genres, i18n.language)}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                  <span className="font-black text-[#333]">{t("duration") || "Thời lượng"}:</span>
                  <span className="text-gray-700 font-bold">{movie.durationMin || "?"} phút</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                  <span className="font-black text-[#333]">{t("release-date")}:</span>
                  <span className="text-gray-700 font-bold">
                    {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("vi-VN") : "?"}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md items-center">
                  <span className="font-black text-[#333]">{t("rated")}:</span>
                  <span className="text-gray-700 font-black flex items-center gap-2">
                    <Chip className={`${movie.ageRating === "P" ? "bg-green-600" : "bg-red-600"} text-white font-black h-6`} size="sm" radius="none">
                      {movie.ageRating || "P"}
                    </Chip>
                  </span>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  onClick={openBooking}
                  className="bg-[#e71a0f] text-white font-black px-8 h-[44px] min-w-[150px] shadow-[0px_4px_0px_#a3120a] border border-black/10 hover:brightness-110 active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase"
                  radius="sm"
                >
                  🎫 {t("buy-ticket")}
                </Button>
              </div>
            </div>
          </div>

          {movie.description && (
            <div className="mt-16 space-y-8">
              <div className="flex items-center justify-center">
                <div className="relative bg-[#b11116] text-white py-3 px-16 font-black uppercase text-sm italic tracking-widest shadow-xl flex items-center gap-4">
                  <span>{t("details")}</span>
                  <div className="absolute top-0 -left-6 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[24px] border-r-[#b11116]" />
                  <div className="absolute top-0 -right-6 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[24px] border-l-[#b11116]" />
                </div>
              </div>
              <div className="bg-white/50 p-6 border-l-4 border-[#b11116]">
                <p className="text-gray-700 leading-7 text-[15px] font-medium">{movie.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)}></div>
          <div className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] bg-[#fdfcf0] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#222] text-white p-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest">
                  {bookingStep === "schedule" ? t("select-showtime")
                    : bookingStep === "seats" ? t("select-seat")
                    : bookingStep === "combos" ? t("popcorn-drinks")
                    : bookingStep === "payment" ? t("payment")
                    : "✅ Đặt vé thành công!"}
                </h3>
                {selectedShowtime && bookingStep !== "schedule" && (
                  <p className="text-xs text-yellow-500 font-bold">
                    {selectedShowtime.movieTitle} | {selectedShowtime.roomName} | {new Date(selectedShowtime.startTime).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="text-2xl font-bold hover:text-red-500 w-10 h-10">✕</button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {/* Step: Schedule */}
              {bookingStep === "schedule" && (
                <div className="p-6 space-y-6 animate-in fade-in duration-300">
                  {showtimes.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-16">Hiện chưa có suất chiếu cho phim này.</p>
                  ) : (
                    Object.entries(cinemaGroups).map(([cinemaName, sts]) => (
                      <div key={cinemaName} className="border-b border-gray-200 pb-6">
                        <h4 className="text-lg font-black mb-4">{cinemaName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {sts.map(st => (
                            <Button
                              key={st.id}
                              onClick={() => handleSelectShowtime(st)}
                              variant="bordered"
                              radius="none"
                              size="sm"
                              className="border border-[#ccc] bg-white text-[#333] font-bold px-6 hover:border-red-600 hover:text-red-600"
                            >
                              {new Date(st.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step: Seats */}
              {bookingStep === "seats" && (
                <div className="bg-white p-6 flex flex-col items-center min-h-[500px] animate-in fade-in duration-300">
                  {loadingSeats ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="w-8 h-8 border-4 border-[#e71a0f] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="w-full max-w-3xl mb-8">
                        <div className="text-center font-bold text-gray-400 mb-2 tracking-[1em] uppercase">{t("select-seat")}</div>
                        <div className="border-t-8 border-gray-300 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] pt-4 text-center">
                          <h4 className="text-2xl font-black text-gray-400 tracking-[0.5em] uppercase">{t("screen")}</h4>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 py-4 overflow-x-auto min-w-fit">
                        {(() => {
                          // Group seats by row letter
                          const rowMap = {};
                          seats.forEach(s => {
                            const row = s.seatNumber.charAt(0);
                            if (!rowMap[row]) rowMap[row] = [];
                            rowMap[row].push(s);
                          });
                          return Object.entries(rowMap).map(([row, rowSeats]) => (
                            <div key={row} className="flex gap-1">
                              <span className="w-5 text-xs text-gray-400 font-bold self-center">{row}</span>
                              {rowSeats.sort((a, b) => {
                                const numA = parseInt(a.seatNumber.slice(1));
                                const numB = parseInt(b.seatNumber.slice(1));
                                return numA - numB;
                              }).map(seat => {
                                const isBooked = seat.status === "BOOKED";
                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                const isVip = ["E","F","G","H","I","J","K","L"].includes(row);
                                let styleClass = "border-2 text-[8px] flex items-center justify-center font-bold cursor-pointer transition-all w-6 h-6 ";
                                if (isBooked) styleClass += "bg-gray-400 border-gray-400 text-white cursor-not-allowed";
                                else if (isSelected) styleClass += "bg-[#b11116] border-[#b11116] text-white";
                                else if (isVip) styleClass += "border-red-500 text-red-500 hover:bg-red-50";
                                else styleClass += "border-green-500 text-green-500 hover:bg-green-50";
                                return (
                                  <div
                                    key={seat.seatNumber}
                                    onClick={() => !isBooked && toggleSeat(seat.seatNumber)}
                                    className={styleClass}
                                  >
                                    {isBooked ? "X" : seat.seatNumber.slice(1)}
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12 mt-8 text-xs font-bold text-gray-600 uppercase border-t pt-8 w-full max-w-2xl">
                        <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#b11116] border-2 border-[#b11116]"></div> {t("selected")}</div>
                        <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-green-500"></div> {t("available")}</div>
                        <div className="flex items-center gap-3"><div className="w-5 h-5 bg-gray-400 border-2 border-gray-400"></div> {t("sold")}</div>
                        <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-red-500"></div> {t("vip")}</div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step: Combos */}
              {bookingStep === "combos" && (
                <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                  <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-red-600">{t("popcorn-drinks")}</div>
                  <div className="space-y-4">
                    {combosList.map(combo => (
                      <div key={combo.id} className="bg-white p-4 border border-gray-200 flex items-center gap-6 group hover:shadow-md transition-shadow">
                        <img src={combo.img} className="w-24 h-24 object-contain group-hover:scale-105 transition-transform" />
                        <div className="flex-grow">
                          <h5 className="font-black text-black uppercase">{combo.name}</h5>
                          <p className="text-xs text-gray-500 mt-1">{combo.desc}</p>
                          <p className="text-red-600 font-black mt-2">{t("price")}: {combo.price.toLocaleString("vi-VN")} đ</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
                          <button onClick={() => updateCombo(combo.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 font-bold hover:bg-red-50 hover:text-red-500 transition-colors">-</button>
                          <span className="font-black w-4 text-center text-black">{selectedCombos[combo.id] || 0}</span>
                          <button onClick={() => updateCombo(combo.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 font-bold hover:bg-red-50 hover:text-red-500 transition-colors">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Payment */}
              {bookingStep === "payment" && (
                <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded font-medium">
                      {bookingError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-black">{t("order-summary")}</div>
                      <div className="bg-white p-6 border border-gray-200 space-y-4 text-black text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-bold text-gray-500">{t("movies")}</span>
                          <span className="font-black uppercase text-right w-48">{movie.title}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-bold text-gray-500">{t("select-seat")}</span>
                          <span className="font-black text-red-600">{selectedSeats.join(", ")}</span>
                        </div>
                        {Object.entries(selectedCombos).map(([id, qty]) => qty > 0 && (
                          <div key={id} className="flex justify-between border-b pb-2 italic">
                            <span>{combosList.find(c => c.id === id)?.name} (x{qty})</span>
                            <span>{((combosList.find(c => c.id === id)?.price || 0) * qty).toLocaleString("vi-VN")} đ</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-4 text-xl font-black">
                          <span>{t("total")}</span>
                          <span className="text-red-600">{calculateTotal().toLocaleString("vi-VN")} đ</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-black">{t("payment-method")}</div>
                      <div className="space-y-3">
                        {[
                          { id: "momo", label: "Ví MoMo" },
                          { id: "zalopay", label: "ZaloPay" },
                          { id: "shopee", label: "ShopeePay" },
                          { id: "atm", label: "Thẻ ATM" },
                          { id: "cash", label: "Tiền mặt tại quầy" },
                        ].map(method => (
                          <label key={method.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-red-500 cursor-pointer transition-colors group">
                            <input
                              type="radio"
                              name="pay"
                              value={method.id}
                              checked={paymentMethod === method.id}
                              onChange={() => setPaymentMethod(method.id)}
                              className="w-5 h-5 accent-red-600"
                            />
                            <span className="font-bold text-gray-700 group-hover:text-red-600">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Success */}
              {bookingStep === "success" && bookingSuccess && (
                <div className="p-12 text-center space-y-6 animate-in fade-in duration-300">
                  <div className="text-6xl">🎉</div>
                  <h3 className="text-2xl font-black text-green-600">Đặt vé thành công!</h3>
                  <div className="bg-green-50 border border-green-200 rounded p-6 text-left space-y-2 max-w-md mx-auto">
                    <p className="font-bold">Mã đặt vé: <span className="text-red-600">{bookingSuccess.bookingCode}</span></p>
                    <p className="font-bold">Phim: <span className="font-normal">{movie.title}</span></p>
                    <p className="font-bold">Ghế: <span className="font-normal">{selectedSeats.join(", ")}</span></p>
                    <p className="font-bold">Tổng tiền: <span className="text-red-600 font-black">{bookingSuccess.totalPrice?.toLocaleString("vi-VN")} đ</span></p>
                  </div>
                  <Button
                    onClick={() => { setIsBookingOpen(false); navigate("/vecuatoi"); }}
                    className="bg-[#e71a0f] text-white font-black px-8 h-[44px]"
                    radius="sm"
                  >
                    Xem vé của tôi →
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            {bookingStep !== "schedule" && bookingStep !== "success" && (
              <div className="bg-black text-white p-2 md:p-3 flex flex-wrap md:flex-nowrap items-stretch gap-4 shrink-0 border-t border-gray-800">
                <div onClick={handlePrevious} className="cursor-pointer bg-[#333] hover:bg-black p-4 flex flex-col items-center justify-center transition-all min-w-[100px] border border-gray-700">
                  <span className="text-3xl">←</span>
                  <span className="text-[10px] font-black uppercase">{t("previous")}</span>
                </div>
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <img src={movie.posterUrl || movie.image || FALLBACK_IMG} className="w-16 h-24 object-cover border border-white/20" />
                  <div className="min-w-0">
                    <h4 className="font-black text-yellow-500 uppercase truncate text-sm md:text-base">{movie.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400">{selectedSeats.length} ghế đã chọn</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center text-right min-w-[150px] px-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("total")}</div>
                  <div className="text-2xl font-black text-white leading-none mt-1">{calculateTotal().toLocaleString("vi-VN")} đ</div>
                </div>
                {bookingStep === "payment" ? (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="cursor-pointer bg-[#e71a0f] hover:brightness-110 p-4 flex flex-col items-center justify-center transition-all min-w-[120px] shadow-[0px_-2px_10px_rgba(231,26,15,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-3xl">✓</span>
                        <span className="text-[10px] font-black uppercase">{t("pay-now")}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div onClick={handleNext} className="cursor-pointer bg-[#e71a0f] hover:brightness-110 p-4 flex flex-col items-center justify-center transition-all min-w-[120px] shadow-[0px_-2px_10px_rgba(231,26,15,0.4)]">
                    <span className="text-3xl">→</span>
                    <span className="text-[10px] font-black uppercase">{t("next")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #eee; }
          `}</style>
        </div>
      )}
    </TNCLayout>
  );
}
