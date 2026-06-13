import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/layouts/staff";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import * as htmlToImage from "html-to-image";
import { moviesApi } from "@/services/moviesApi";
import { showtimesApi } from "@/services/showtimesApi";
import { bookingsApi } from "@/services/bookingsApi";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const COLS = 10;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80";

const STEPS = ["Chọn phim & suất", "Chọn ghế", "Xác nhận & in vé"];

const formatTimeSafe = (isoString) => {
  try {
    if (!isoString) return "??:??";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      if (typeof isoString === "string" && isoString.includes(":")) {
        return isoString;
      }
      return "??:??";
    }
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(isoString || "??:??");
  }
};

const formatDateSafe = (isoString) => {
  try {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
};

const formatDateTimeSafe = (isoString) => {
  try {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleString("vi-VN");
  } catch {
    return String(isoString || "—");
  }
};

export default function BanVe() {
  const [step, setStep] = useState(0);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [printed, setPrinted] = useState(false);
  
  // Loading & error states
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  const receiptRef = useRef(null);

  // 1. Fetch movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setLoadingMovies(true);
      console.log("[POS] Fetching movies...");
      try {
        const data = await moviesApi.getMovies();
        console.log("[POS] Raw movies data:", data);
        
        // Filter for movies that are active/released/sneak show
        const activeMovies = Array.isArray(data) 
          ? data.filter(m => ["ACTIVE", "RELEASED", "SNEAK_SHOW"].includes(m.status || m.TrangThai))
          : [];
        console.log("[POS] Filtered active movies:", activeMovies);
        
        setMovies(activeMovies.length > 0 ? activeMovies : (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("[POS] Failed to fetch movies:", err);
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, []);

  // 2. Fetch showtimes when movie changes
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedMovie) {
        setShowtimes([]);
        setSelectedShowtime(null);
        return;
      }
      setLoadingShowtimes(true);
      const movieId = selectedMovie.id || selectedMovie.MaPhim;
      console.log(`[POS] Fetching showtimes for movie: ${selectedMovie.title || selectedMovie.TenPhim} (ID: ${movieId})...`);
      try {
        const data = await showtimesApi.getShowtimes({ movieId });
        console.log("[POS] Raw showtimes response:", data);
        setShowtimes(Array.isArray(data) ? data : []);
        setSelectedShowtime(null);
      } catch (err) {
        console.error("[POS] Failed to fetch showtimes:", err);
      } finally {
        setLoadingShowtimes(false);
      }
    };
    fetchShowtimes();
  }, [selectedMovie]);

  // 3. Fetch seats when showtime changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedShowtime) {
        setSeats([]);
        setSelectedSeats([]);
        return;
      }
      setLoadingSeats(true);
      const showtimeId = selectedShowtime.id || selectedShowtime.MaSuat;
      console.log(`[POS] Fetching seats for showtime: ${showtimeId}...`);
      try {
        const data = await showtimesApi.getShowtimeSeats(showtimeId);
        console.log("[POS] Raw seats response:", data);
        setSeats(Array.isArray(data) ? data : []);
        setSelectedSeats([]);
      } catch (err) {
        console.error("[POS] Failed to fetch seats:", err);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [selectedShowtime]);

  const handleMovieSelect = (movie) => {
    console.log("[POS] User clicked movie:", movie);
    setSelectedMovie(movie);
  };

  const toggleSeat = (seatNumber) => {
    const seatData = seats.find(s => (s.seatNumber === seatNumber || s.MaGhe === seatNumber));
    if (seatData?.status === "BOOKED" || seatData?.TrangThai === "ĐÃ BÁN") return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber) 
        ? prev.filter((s) => s !== seatNumber) 
        : [...prev, seatNumber]
    );
  };

  const getTicketPrice = () => {
    return selectedShowtime?.basePrice || selectedShowtime?.GiaVe || 100000;
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    setBookingError("");
    
    const showtimeId = selectedShowtime.id || selectedShowtime.MaSuat;
    console.log("[POS] Proceeding to checkout for showtime:", showtimeId);
    
    try {
      const ticketPrice = getTicketPrice();
      const ticketsPayload = selectedSeats.map(seatNumber => ({
        seatNumber,
        price: ticketPrice,
        type: "seat",
      }));

      const data = await bookingsApi.createBooking({
        showtimeId,
        tickets: ticketsPayload,
        paymentMethod: "cash",
      });

      console.log("[POS] Booking response:", data);
      setBookingResult(data);
      setStep(2);
    } catch (err) {
      console.error("[POS] Checkout failed:", err);
      const msg = err.response?.data?.error || "Đặt vé thất bại. Vui lòng kiểm tra lại ghế hoặc thử lại.";
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePrint = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(receiptRef.current, { backgroundColor: '#1e293b' });
        const link = document.createElement("a");
        const code = bookingResult?.bookingCode || bookingResult?.MaGiaoDich || "TNC";
        link.download = `Hoadon-${code}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Oops, something went wrong printing receipt!", err);
      }
    }
    setPrinted(true);
  };

  const reset = () => {
    setStep(0); 
    setSelectedMovie(null); 
    setSelectedShowtime(null);
    setSelectedSeats([]); 
    setPrinted(false);
    setBookingResult(null);
    setBookingError("");
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-white">Bán Vé Tại Quầy</h1>

        {/* Steps */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg ${i <= step ? "bg-[#e71a0f] text-white" : "bg-white/10 text-white/40"}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-bold hidden sm:block tracking-wide uppercase ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="text-white/20 mx-2 text-xl">›</span>}
            </div>
          ))}
        </div>

        {bookingError && (
          <div className="p-4 bg-red-950/50 border border-red-500/30 text-red-200 rounded-xl text-sm font-bold">
            ⚠️ {bookingError}
          </div>
        )}

        {/* Step 0: Chọn phim & suất */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
              <CardHeader className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-black text-white/80 uppercase">Chọn phim đang chiếu</h3>
              </CardHeader>
              <CardBody className="px-6 py-4">
                {loadingMovies ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-[#e71a0f] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : movies.length === 0 ? (
                  <p className="text-center text-white/50 py-8">Không có phim nào đang chiếu.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {movies.map((m, i) => {
                      const mId = m.id || m.MaPhim;
                      const isSelected = selectedMovie?.id === mId || selectedMovie?.MaPhim === mId;
                      
                      return (
                        <button
                          key={mId || i}
                          onClick={() => handleMovieSelect(m)}
                          className={`flex items-center gap-4 p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? "border-[#e71a0f] bg-[#e71a0f]/20 shadow-[0_0_15px_rgba(231,26,15,0.2)]"
                              : "border-white/5 hover:border-white/30 bg-white/5"
                          }`}
                        >
                          {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-[#e71a0f]/20 to-transparent pointer-events-none"></div>}
                          <img src={m.posterUrl || m.AnhPhim || FALLBACK_IMG} alt={m.title || m.TenPhim} className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
                          <div className="relative z-10 w-full">
                            <p className="text-sm font-black text-white truncate">{m.title || m.TenPhim}</p>
                            <p className="text-[10px] text-white/50 mt-1 uppercase font-bold tracking-widest">{m.durationMin || m.ThoiLuong || "?"} phút</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            {selectedMovie && (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-top-4 duration-300">
                <CardHeader className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white/80 uppercase">Chọn suất chiếu</h3>
                </CardHeader>
                <CardBody className="px-6 py-4">
                  {loadingShowtimes ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="w-6 h-6 border-4 border-[#e71a0f] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : showtimes.length === 0 ? (
                    <p className="text-sm text-white/50 italic">Không tìm thấy suất chiếu hôm nay cho phim này.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {showtimes.map((st) => {
                        const stId = st.id || st.MaSuat;
                        const isStSelected = selectedShowtime?.id === stId || selectedShowtime?.MaSuat === stId;
                        const startTimeVal = st.startTime || st.ThoiGianBatDau;
                        const roomNameVal = st.roomName || st.TenPhong || `P.${st.roomId || st.MaPhong}`;
                        const formattedTime = formatTimeSafe(startTimeVal);
                        const formattedDate = formatDateSafe(startTimeVal);

                        return (
                          <Button
                            key={stId}
                            onClick={() => setSelectedShowtime(st)}
                            size="md"
                            className={`font-black ${
                              isStSelected
                                ? "bg-[#e71a0f] text-white shadow-[0_4px_10px_rgba(231,26,15,0.4)]"
                                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                            }`}
                          >
                            {formattedTime} {formattedDate && <span className="text-[10px] opacity-75 font-normal ml-1">({formattedDate})</span>}
                            <span className="text-[10px] opacity-75 ml-1">({roomNameVal})</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            <Button
              size="lg"
              fullWidth
              disabled={!selectedMovie || !selectedShowtime}
              onClick={() => setStep(1)}
              className="bg-[#e71a0f] text-white font-black disabled:opacity-30 shadow-[0_4px_10px_rgba(231,26,15,0.3)] hover:shadow-[0_4px_15px_rgba(231,26,15,0.5)]"
            >
              Tiếp theo →
            </Button>
          </div>
        )}

        {/* Step 1: Chọn ghế */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <p className="text-xl font-black text-white tracking-widest uppercase">{selectedMovie?.title || selectedMovie?.TenPhim}</p>
                  <p className="text-sm font-bold text-[#e71a0f] mt-1">
                    {formatDateTimeSafe(selectedShowtime?.startTime || selectedShowtime?.ThoiGianBatDau)} ({selectedShowtime?.roomName || selectedShowtime?.TenPhong || `P.${selectedShowtime?.roomId || selectedShowtime?.MaPhong}`})
                  </p>
                </div>
                
                <div className="flex justify-center gap-6 text-xs text-white/50 mb-8 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded border-2 border-green-500"></span>Trống</span>
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-[#e71a0f] border-2 border-[#e71a0f] shadow-[0_0_10px_rgba(231,26,15,0.4)]"></span>Đang chọn</span>
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-white/20 border-2 border-white/20 opacity-50"></span>Đã bán</span>
                </div>
                
                <div className="flex justify-center mb-10">
                  <div className="w-3/4 flex flex-col items-center gap-2">
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.1)]"></div>
                    <div className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20">MÀN HÌNH</div>
                  </div>
                </div>

                {loadingSeats ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-10 h-10 border-4 border-[#e71a0f] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1.5 overflow-x-auto">
                    {ROWS.map((row) => (
                      <div key={row} className="flex items-center gap-1.5 justify-center">
                        <span className="text-xs text-white/30 w-4 text-right">{row}</span>
                        {Array.from({ length: COLS }, (_, c) => {
                          const seatNumber = `${row}${c + 1}`;
                          const seatData = seats.find(s => (s.seatNumber === seatNumber || s.MaGhe === seatNumber));
                          const isSold = seatData ? (seatData.status === "BOOKED" || seatData.TrangThai === "ĐÃ BÁN") : false;
                          const isSelected = selectedSeats.includes(seatNumber);
                          
                          return (
                            <button
                              key={seatNumber}
                              onClick={() => toggleSeat(seatNumber)}
                              disabled={isSold}
                              className={`w-8 h-8 rounded text-xs font-black transition-all flex-shrink-0 flex items-center justify-center border-2 hover:scale-110 ${
                                isSold ? "bg-white/10 border-transparent text-white/30 cursor-not-allowed" :
                                isSelected ? "bg-[#e71a0f] border-[#e71a0f] text-white shadow-[0_0_10px_rgba(231,26,15,0.5)]" :
                                "bg-transparent border-green-500 text-green-500 hover:bg-green-500/20"
                              }`}
                            >
                              {isSold ? "X" : c + 1}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-[#e71a0f]/50 shadow-[0_0_20px_rgba(231,26,15,0.1)]">
              <CardBody className="p-5 flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Ghế đang chọn: <span className="font-bold text-white text-lg ml-2">{selectedSeats.join(", ") || "—"}</span></p>
                  <p className="text-sm text-white/60">Tổng thanh toán: <span className="font-black text-[#f6c344] text-xl ml-2">{(selectedSeats.length * getTicketPrice()).toLocaleString("vi-VN")} đ</span></p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" onClick={() => setStep(0)} variant="flat" className="bg-white/10 text-white font-bold px-8">← Thông Tin</Button>
                  <Button
                    size="lg"
                    disabled={selectedSeats.length === 0 || bookingLoading}
                    onClick={handleCheckout}
                    className="bg-[#e71a0f] text-white font-black px-10 shadow-[0_4px_10px_rgba(231,26,15,0.4)] disabled:opacity-50"
                  >
                    {bookingLoading ? "Đang xử lý..." : "Thanh Toán"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 2: Xác nhận & in vé */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {!printed ? (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 max-w-xl mx-auto">
                <CardBody className="p-8">
                  <div ref={receiptRef} className="p-6 bg-[#1e293b] rounded-2xl">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#e71a0f]/20 text-[#e71a0f] rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(231,26,15,0.3)]">
                        <span className="text-2xl font-black">TNC</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">HÓA ĐƠN ĐÃ THANH TOÁN</h3>
                    </div>
                  
                    <div className="space-y-3 text-sm p-4 bg-black/30 rounded-xl border border-white/5">
                      {[
                        ["Mã giao dịch", bookingResult?.bookingCode || bookingResult?.MaGiaoDich || "—"],
                        ["Phim",         selectedMovie?.title || selectedMovie?.TenPhim],
                        ["Suất chiếu",   selectedShowtime ? formatDateTimeSafe(selectedShowtime.startTime || selectedShowtime.ThoiGianBatDau) : ""],
                        ["Phòng chiếu",  selectedShowtime?.roomName || selectedShowtime?.TenPhong || `Phòng ${selectedShowtime?.roomId || selectedShowtime?.MaPhong}`],
                        ["Vị trí ghế",   selectedSeats.join(", ")],
                        ["Số lượng vé",  `${selectedSeats.length} vé`],
                        ["TỔNG THU",    `${(bookingResult?.totalPrice || bookingResult?.TongTien || (selectedSeats.length * getTicketPrice())).toLocaleString("vi-VN")} đ`],
                      ].map(([k, v], i) => (
                        <div key={k} className={`flex justify-between py-2 ${i === 6 ? "border-t border-white/20 mt-2 pt-4" : "border-b border-white/5"}`}>
                          <span className={`text-white/60 ${i===6?"uppercase font-bold tracking-widest":""}`}>{k}</span>
                          <span className={`font-black ${i===6?"text-2xl text-[#f6c344]":"text-white"}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button size="lg" onClick={() => setStep(1)} variant="flat" className="flex-1 bg-white/10 text-white font-bold">← CHỈNH SỬA</Button>
                    <Button size="lg" onClick={handlePrint} className="flex-1 bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]">IN VÉ NGAY</Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-emerald-500/30 max-w-xl mx-auto shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                <CardBody className="p-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                    <span className="text-5xl font-black">OK</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">ĐÃ XUẤT VÉ!</h3>
                  <p className="text-white/60 mb-8">Vui lòng giao vé cho khách hàng. Chúc khách hàng xem phim vui vẻ.</p>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 w-full mb-8">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Mã Giao Dịch</p>
                    <p className="font-mono text-xl font-bold text-[#f6c344]">{bookingResult?.bookingCode || bookingResult?.MaGiaoDich}</p>
                  </div>
                  <Button size="lg" onClick={reset} fullWidth className="bg-[#e71a0f] text-white font-black">
                    + GIAO DỊCH MỚI
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
