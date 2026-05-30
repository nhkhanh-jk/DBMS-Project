import { useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translateCinemaAddress, translateFormat } from "@/utils/localize";

const movieDataByDate = {
  "23": [
    {
      title: "QUỶ NHẬP TRÀNG 2",
      rating: "T18",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Phụ Đề Anh", times: ["10:00", "14:30", "22:15"] },
        { name: "IMAX Phụ Đề Anh", times: ["12:00", "18:00"] }
      ]
    },
    {
      title: "KUNGFU PANDA 4",
      rating: "P",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Lồng Tiếng", times: ["09:00", "11:15", "13:30", "15:45", "17:30", "20:00"] }
      ]
    }
  ],
  "24": [
    {
      title: "DUNE: HÀNH TINH CÁT - PHẦN 2",
      rating: "T13",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Phụ Đề Việt", times: ["13:00", "16:20", "19:40", "22:30"] },
        { name: "4DX Phụ Đề Việt", times: ["14:00", "18:00"] }
      ]
    },
    {
      title: "KUNGFU PANDA 4",
      rating: "P",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Lồng Tiếng", times: ["10:30", "12:45", "15:00", "17:15"] }
      ]
    }
  ],
  "25": [
    {
      title: "MAI",
      rating: "T18",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Việt Nam", times: ["09:30", "12:15", "15:00", "17:45", "20:30", "23:15"] }
      ]
    },
    {
      title: "QUỶ NHẬP TRÀNG 2",
      rating: "T18",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80",
      formats: [
        { name: "2D Phụ Đề Anh", times: ["12:00", "16:30", "21:00"] }
      ]
    }
  ]
};

const TICKET_PRICE = 105000;
const VIP_SURCHARGE = 20000;
const SWEETBOX_SURCHARGE = 40000;

export default function RapChiTietPage() {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState("23");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState("seats");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("TNC Vincom Đà Nẵng");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});

  const combosList = [
    { id: "1", name: "MY COMBO", desc: "1 Bắp (vị ngọt/mặn) + 1 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 85000, img: "https://www.cgv.vn/media/concession/m-combo.png" },
    { id: "2", name: "CGV COMBO", desc: "1 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 115000, img: "https://www.cgv.vn/media/concession/cgv-combo.png" },
    { id: "3", name: "COUPLE COMBO", desc: "2 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 155000, img: "https://www.cgv.vn/media/concession/couple-combo.png" },
    { id: "4", name: "PARTY COMBO", desc: "3 Bắp (vị ngọt/mặn) + 3 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 215000, img: "https://www.cgv.vn/media/concession/party-combo.png" },
  ];

  const toggleSeat = (id) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(prev => prev.filter(s => s !== id));
    } else {
      if (selectedSeats.length >= 8) {
        alert(t("max-8-tickets") || "Bạn chỉ có thể chọn tối đa 8 vé!");
        return;
      }
      setSelectedSeats(prev => [...prev, id]);
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
    const seatTotal = selectedSeats.reduce((sum, id) => {
      let price = TICKET_PRICE;
      const row = id[0];
      if (["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"].includes(row)) price += VIP_SURCHARGE;
      if (row === "P") price += SWEETBOX_SURCHARGE;
      return sum + price;
    }, 0);

    const comboTotal = Object.entries(selectedCombos).reduce((sum, [id, qty]) => {
      const combo = combosList.find(c => c.id === id);
      return sum + (combo?.price || 0) * qty;
    }, 0);

    return seatTotal + comboTotal;
  };

  const handleNext = () => {
    if (bookingStep === "seats" && selectedSeats.length === 0) {
      alert(t("please-select-seat") || "Vui lòng chọn ghế!");
      return;
    }
    if (bookingStep === "seats") setBookingStep("combos");
    else if (bookingStep === "combos") setBookingStep("payment");
  };

  const handlePrevious = () => {
    if (bookingStep === "combos") setBookingStep("seats");
    else if (bookingStep === "payment") setBookingStep("combos");
  };

  const renderSeatSummary = () => {
    if (selectedSeats.length === 0) return "-";
    if (selectedSeats.length <= 4) return selectedSeats.join(", ");
    const row1 = selectedSeats.slice(0, 4);
    const row2 = selectedSeats.slice(4);
    return (
      <div className="flex flex-col">
        <span>{row1.join(", ")},</span>
        <span>{row2.join(", ")}</span>
      </div>
    );
  };

  const renderSeatGrid = () => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "P"];
    const cols = Array.from({ length: 20 }, (_, i) => 20 - i);
    return (
      <div className="flex flex-col items-center gap-1.5 py-8 overflow-x-auto min-w-fit">
        {rows.map(row => (
          <div key={row} className="flex gap-1">
            {cols.map(col => {
              const id = `${row}${col}`;
              const isVip = ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"].includes(row);
              const isSweetbox = row === "P";
              const isSold = ["J10", "K12", "K11"].includes(id);
              const isSelected = selectedSeats.includes(id);
              let styleClass = "border-2 text-[8px] flex items-center justify-center font-bold cursor-pointer transition-all w-6 h-6 ";
              if (isSold) styleClass += "bg-gray-400 border-gray-400 text-white cursor-not-allowed";
              else if (isSelected) styleClass += "bg-[#b11116] border-[#b11116] text-white";
              else if (isSweetbox) styleClass += "border-pink-500 text-pink-500 hover:bg-pink-50";
              else if (isVip) styleClass += "border-red-500 text-red-500 hover:bg-red-50";
              else styleClass += "border-green-500 text-green-500 hover:bg-green-50";
              return (
                <div key={id} onClick={() => !isSold && toggleSeat(id)} className={styleClass}>
                  {isSold ? "X" : id}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const dates = [
    { month: "03", day: "23", weekday: "MON" },
    { month: "03", day: "24", weekday: "TUE" },
    { month: "03", day: "25", weekday: "WED" },
    { month: "03", day: "26", weekday: "THU" },
    { month: "03", day: "27", weekday: "FRI" },
    { month: "03", day: "28", weekday: "SAT" },
    { month: "03", day: "29", weekday: "SUN" },
    { month: "03", day: "30", weekday: "MON" },
    { month: "03", day: "31", weekday: "TUE" },
    { month: "04", day: "01", weekday: "WED" },
    { month: "04", day: "02", weekday: "THU" },
  ];

  const currentMovies = movieDataByDate[selectedDay] || [];

  return (
    <TNCLayout>
      <div className="bg-[#fcfbf7] min-h-screen pb-20">
        <div className="mx-auto max-w-5xl px-4 py-8">
          
          {/* Back Button and Header Title */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <Link to="/rap">
                <Button 
                    variant="flat" 
                    className="bg-[#333] text-white font-bold h-8 px-4" 
                    radius="none"
                    startContent={<span>←</span>}
                >
                    {t("previous")}
                </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center my-6">
            <hr className="flex-grow border-gray-400" />
            <h2 
              className="mx-4 text-4xl font-black uppercase tracking-[0.2em] font-serif text-[#333]" 
              style={{ textShadow: "2px 2px 0 #fff, 3px 3px 0 #ccc" }}
            >
              {t("cinemas")}
            </h2>
            <hr className="flex-grow border-gray-400" />
          </div>
          <h3 className="text-center text-3xl text-[#555] font-semibold mb-8">
            TNC Vincom Đà Nẵng
          </h3>

          {/* Banner with Address Overlay */}
          <div className="relative w-full h-[300px] md:h-[400px] bg-black overflow-hidden shadow-lg border-2 border-transparent">
            <Image 
              removeWrapper 
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80" 
              className="w-full h-full object-cover opacity-90" 
              alt="TNC Vincom Đà Nẵng" 
            />
            {/* Dark overlay at bottom */}
            <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center z-10">
              <div className="text-[13px] leading-6 mb-4 md:mb-0">
                <p><span className="font-bold">{t("address")}:</span> {translateCinemaAddress("Tầng 4, TTTM Vincom Đà Nẵng, đường Ngô Quyền, P.An Hải Bắc, Q.Sơn Trà, TP. Đà Nẵng", i18n.language)}</p>
                <p><span className="font-bold">Fax:</span> +84 4 6 275 5240</p>
                <p><span className="font-bold">Hotline:</span> 1900 6017</p>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button className="bg-[#e71a0f] text-white font-bold w-full md:w-32" size="sm" radius="none">
                  {t("view-map") || "VIEW MAP"}
                </Button>
                <Button className="bg-[#e71a0f] text-white font-bold w-full md:w-32" size="sm" radius="none">
                  {t("contact-tnc") || "CONTACT TNC"}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs: Lịch Chiếu | Giá vé */}
          <div className="flex justify-center mt-12 mb-8">
            <div className="bg-[#e71a0f] text-white font-bold px-10 py-3 flex items-center shadow-md relative
                            before:content-[''] before:absolute before:left-[-15px] before:top-0 before:border-r-[15px] before:border-t-[24px] before:border-b-[24px] before:border-t-transparent before:border-b-transparent before:border-r-[#e71a0f]
                            after:content-[''] after:absolute after:right-[-15px] after:top-0 after:border-l-[15px] after:border-t-[24px] after:border-b-[24px] after:border-t-transparent after:border-b-transparent after:border-l-[#e71a0f]">
              <span className="cursor-pointer tracking-wider">{t("showtime")}</span>
              <span className="mx-3 font-normal opacity-60">|</span>
              <span className="cursor-pointer font-normal opacity-80 hover:opacity-100 transition-opacity">{t("ticket-price") || "Ticket Price"}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center justify-center gap-1 mt-6 border-y border-[#333] py-4 max-w-4xl mx-auto overflow-x-auto bg-white/50">
            <button className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold leading-none mx-2">
              &lt;
            </button>
            
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {dates.map((d, index) => {
                const isSelected = selectedDay === d.day;
                const isRecentThree = index < 3;
                
                return (
                  <div 
                    key={index} 
                    onClick={() => setSelectedDay(d.day)}
                    className={`flex flex-col items-center justify-center min-w-[64px] h-16 cursor-pointer transition-all relative rounded-sm
                                ${isSelected ? 'bg-black text-white shadow-lg scale-110 z-10' : 'bg-[#e1e1e1] text-[#666] hover:bg-gray-300'} `}
                  >
                    {isRecentThree && !isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-[#e71a0f] rounded-full border border-white"></div>
                    )}
                    <span className="text-[10px] font-black tracking-tighter opacity-80">{d.weekday}</span>
                    <span className="text-xl font-black leading-none my-0.5">{d.day}</span>
                    <span className="text-[9px] font-bold opacity-70 underline decoration-1 underline-offset-2 tracking-widest">{d.month}</span>
                  </div>
                );
              })}
            </div>

            <button className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold leading-none mx-2">
              &gt;
            </button>
          </div>

          {/* Combined Movie List */}
          <div className="max-w-4xl mx-auto mt-10 space-y-12">
            {currentMovies.length > 0 ? (
              currentMovies.map((movie, mIdx) => (
                <div key={mIdx}>
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-300">
                    <h4 className="text-[22px] font-black uppercase text-[#333] tracking-tight">{movie.title}</h4>
                    <Chip className="bg-[#e71a0f] text-white font-black" radius="sm" size="sm">{movie.rating}</Chip>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Image 
                        radius="none"
                        src={movie.image} 
                        className="w-32 h-48 object-cover shadow-md border border-gray-200"
                        alt={movie.title}
                      />
                    </div>
                    <div className="flex-grow space-y-6">
                      {movie.formats.map((format, fIdx) => (
                        <div key={fIdx}>
                          <p className="font-bold text-[16px] mb-3 text-[#333] border-l-4 border-[#e71a0f] pl-3">
                            {translateFormat(format.name, i18n.language)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {format.times.map((time, tIdx) => (
                              <Button 
                                key={tIdx}
                                onClick={() => {
                                  setSelectedMovie(movie);
                                  setSelectedTime(time);
                                  setBookingStep("seats");
                                  setIsBookingOpen(true);
                                }}
                                className="border border-[#ccc] bg-white text-[#333] font-bold shadow-sm hover:border-[#b11116] hover:text-[#b11116] transition-all" 
                                radius="none"
                                size="sm"
                                variant="bordered"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 font-medium italic">
                {t("no-showtimes-message") || "Sorry, no showtimes for this date. Please pick another day."}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BOOKING MODAL */}
      {isBookingOpen && selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)}></div>
            <div className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] bg-[#fdfcf0] shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#222] text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest">
                            {bookingStep === "schedule" ? t("select-showtime") : bookingStep === "combos" ? t("popcorn-drinks") : bookingStep === "payment" ? t("payment") : t("booking-online") || "CHỌN GHẾ"}
                        </h3>
                        {bookingStep !== "schedule" && (
                            <p className="text-xs text-yellow-500 font-bold">
                                {selectedCinema} | {selectedDay}/03/2026 {selectedTime}
                            </p>
                        )}
                    </div>
                    <button onClick={() => setIsBookingOpen(false)} className="text-2xl font-bold hover:text-red-500 w-10 h-10">✕</button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {bookingStep === "seats" ? (
                        <div className="bg-white p-6 flex flex-col items-center min-h-[500px] animate-in fade-in duration-300">
                            <div className="w-full max-w-3xl mb-12">
                                <div className="text-center font-bold text-gray-400 mb-2 tracking-[1em] uppercase">{t("select-seat") || "CHỌN GHẾ"}</div>
                                <div className="border-t-8 border-gray-300 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] pt-4 text-center">
                                    <h4 className="text-2xl font-black text-gray-400 tracking-[0.5em] uppercase">{t("screen") || "MÀN HÌNH"}</h4>
                                </div>
                            </div>
                            {renderSeatGrid()}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12 mt-8 text-xs font-bold text-gray-600 uppercase border-t pt-8 w-full max-w-2xl">
                                <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#b11116] border-2 border-[#b11116]"></div> {t("selected") || "Đang Chọn"}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-green-500"></div> {t("available") || "Trống"}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 bg-gray-400 border-2 border-gray-400"></div> {t("sold") || "Đã Bán"}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-red-500"></div> {t("vip") || "VIP"}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-pink-500 text-center leading-4 text-[10px]">X</div> {t("cannot-pick") || "Không Thể Chọn"}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-pink-500"></div> {t("sweetbox") || "Ghế Đôi"}</div>
                            </div>
                        </div>
                    ) : bookingStep === "combos" ? (
                        <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                           <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-red-600">{t("popcorn-drinks") || "Bắp nước"}</div>
                           <div className="space-y-4">
                              {combosList.map(combo => (
                                <div key={combo.id} className="bg-white p-4 border border-gray-200 flex items-center gap-6 group hover:shadow-md transition-shadow">
                                   <img src={combo.img} className="w-24 h-24 object-contain group-hover:scale-105 transition-transform" />
                                   <div className="flex-grow">
                                      <h5 className="font-black text-black uppercase">{combo.name}</h5>
                                      <p className="text-xs text-gray-500 mt-1">{combo.desc}</p>
                                      <p className="text-red-600 font-black mt-2">{t("price") || "Giá"}: {combo.price.toLocaleString("vi-VN")} đ</p>
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
                    ) : (
                        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-black">{t("order-summary") || "Tóm Tắt Đơn Hàng"}</div>
                                    <div className="bg-white p-6 border border-gray-200 space-y-4 text-black text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-gray-500">{t("movies") || "Phim"}</span>
                                            <span className="font-black uppercase text-right w-48">{selectedMovie.title}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-gray-500">{t("select-seat") || "Ghế Chọn"}</span>
                                            <span className="font-black text-red-600">{selectedSeats.join(", ")}</span>
                                        </div>
                                        {Object.entries(selectedCombos).map(([id, qty]) => qty > 0 && (
                                            <div key={id} className="flex justify-between border-b pb-2 italic">
                                                <span>{combosList.find(c => c.id === id)?.name} (x{qty})</span>
                                                <span>{((combosList.find(c => c.id === id)?.price || 0) * qty).toLocaleString("vi-VN")} đ</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pt-4 text-xl font-black">
                                            <span>{t("total") || "Tổng Tiền"}</span>
                                            <span className="text-red-600">{calculateTotal().toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-[#f2f2f2] p-4 text-sm font-black text-[#333] uppercase border-l-4 border-black">{t("payment-method") || "Phương Thức Thanh Toán"}</div>
                                    <div className="space-y-3">
                                        {["Ví MoMo", "ZaloPay", "ShopeePay", "Thẻ ATM", "Thẻ Visa/Mastercard"].map(method => (
                                            <label key={method} className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-red-500 cursor-pointer transition-colors group">
                                                <input type="radio" name="pay" className="w-5 h-5 accent-red-600" />
                                                <span className="font-bold text-gray-700 group-hover:text-red-600">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {bookingStep !== "schedule" && (
                    <div className="bg-black text-white p-2 md:p-3 flex flex-wrap md:flex-nowrap items-stretch gap-4 shrink-0 border-t border-gray-800">
                        {bookingStep !== "seats" && (
                            <div onClick={handlePrevious} className="cursor-pointer bg-[#333] hover:bg-black p-4 flex flex-col items-center justify-center transition-all min-w-[100px] border border-gray-700">
                                <span className="text-3xl">←</span>
                                <span className="text-[10px] font-black uppercase">{t("previous") || "QUAY LẠI"}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                            <img src={selectedMovie.image} className="w-16 h-24 object-cover border border-white/20" />
                            <div className="min-w-0">
                                <h4 className="font-black text-yellow-500 uppercase truncate text-sm md:text-base">{selectedMovie.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400">2D | {selectedMovie.rating}</p>
                            </div>
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-bold min-w-[300px] px-4 border-x border-gray-800 items-center">
                            <div className="text-gray-500 uppercase">{t("cinemas") || "Rạp"}</div><div className="text-white truncate">{selectedCinema}</div>
                            <div className="text-gray-500 uppercase text-[9px] leading-tight">{t("showtime") || "Thời Gian Dự Kiến"}</div>
                            <div className="text-white text-[10px]">{selectedTime}, {selectedDay}/03/2026</div>
                            <div className="text-gray-500 uppercase">{t("select-seat") || "Ghế Chọn"}</div>
                            <div className="text-yellow-500 font-black text-[10px]">{renderSeatSummary()}</div>
                        </div>
                        <div className="flex flex-col justify-center text-right min-w-[150px] px-4">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("total") || "TỔNG THU"}</div>
                            <div className="text-2xl font-black text-white leading-none mt-1">{calculateTotal().toLocaleString("vi-VN")} đ</div>
                        </div>
                        <div onClick={handleNext} className="cursor-pointer bg-[#e71a0f] hover:brightness-110 p-4 flex flex-col items-center justify-center transition-all min-w-[120px] shadow-[0px_-2px_10px_rgba(231,26,15,0.4)]">
                            <span className="text-3xl">→</span>
                            <span className="text-[10px] font-black uppercase">{bookingStep === "payment" ? (t("pay-now") || "Thanh toán") : (t("next") || "Tiếp tục")}</span>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #eee; }
            `}</style>
        </div>
      )}
    </TNCLayout>
  );
}
