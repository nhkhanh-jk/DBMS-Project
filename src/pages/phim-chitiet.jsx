import { useState } from "react";
import { useParams } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useTranslation } from "react-i18next";
import movies from "../data/movies";
import { slugify } from "@/utils/slugify";



const TICKET_PRICE = 105000;
const VIP_SURCHARGE = 20000;
const SWEETBOX_SURCHARGE = 40000;

export default function PhimChiTietPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState("schedule");
  const [selectedDay, setSelectedDay] = useState("23");
  const [selectedRegion, setSelectedRegion] = useState("Hồ Chí Minh");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});

  const movie = movies.find((m) => slugify(m.title) === slug) || movies[0];
  const trailerUrl = "https://www.youtube.com/watch?v=S_vO_0v573Q";

  const combosList = [
    { id: "1", name: "MY COMBO", desc: "1 Bắp (vị ngọt/mặn) + 1 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 85000, img: "https://www.cgv.vn/media/concession/m-combo.png" },
    { id: "2", name: "CGV COMBO", desc: "1 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 115000, img: "https://www.cgv.vn/media/concession/cgv-combo.png" },
    { id: "3", name: "COUPLE COMBO", desc: "2 Bắp (vị ngọt/mặn) + 2 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 155000, img: "https://www.cgv.vn/media/concession/couple-combo.png" },
    { id: "4", name: "PARTY COMBO", desc: "3 Bắp (vị ngọt/mặn) + 3 Nước (Pepsi/7Up/Mirinda/Sprit)", price: 215000, img: "https://www.cgv.vn/media/concession/party-combo.png" },
  ];

  const cinemasByRegion = {
    "Hồ Chí Minh": [
      { name: "TNC Vincom Đồng Khởi", formats: [{ name: "2D Phụ Đề Anh", times: ["10:15", "13:45", "16:30", "20:00"] }] },
      { name: "TNC Vincom Thủ Đức", formats: [{ name: "2D Phụ Đề Anh", times: ["11:00", "14:20", "18:15", "23:20"] }] },
      { name: "TNC Vincom Gò Vấp", formats: [{ name: "2D Phụ Đề Anh", times: ["09:30", "15:00", "19:45"] }] },
    ],
    "Đà Nẵng": [
      { name: "TNC Vincom Đà Nẵng", formats: [{ name: "2D Phụ Đề Anh", times: ["09:00", "12:30", "15:45"] }] },
    ],
    "Hà Nội": [
      { name: "TNC Vincom Bà Triệu", formats: [{ name: "2D Phụ Đề Anh", times: ["08:30", "11:45", "15:00"] }] },
    ],
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

  const toggleSeat = (id) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(prev => prev.filter(s => s !== id));
    } else {
      if (selectedSeats.length >= 8) {
        alert(t("max-8-tickets"));
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
      alert(t("please-select-seat"));
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
                 <img src={movie.image} alt={movie.title} className="w-full h-auto object-cover" />
              </div>
            </div>

            <div className="flex-grow space-y-6 animate-in fade-in slide-in-from-right duration-700">
              <h1 className="text-4xl font-black text-[#333] uppercase leading-tight tracking-tight">{movie.title}</h1>
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                   <span className="font-black text-[#333]">{t("director")}:</span>
                   <span className="text-gray-700 font-bold">{movie.title === "QUỶ NHẬP TRÀNG 2" ? "Pom Nguyễn" : "Daniel Chong"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                   <span className="font-black text-[#333]">{t("cast")}:</span>
                   <span className="text-gray-700 font-bold">{movie.title === "QUỶ NHẬP TRÀNG 2" ? "Khả Như, Doãn Quốc Đam, Ngọc Hướng..." : "Jon Hamm, Bobby Moynihan, Piper Curda"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                    <span className="font-black text-[#333]">{t("genre")}:</span>
                    <span className="text-gray-700 font-bold">{movie.genre}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md">
                    <span className="font-black text-[#333]">{t("release-date")}:</span>
                    <span className="text-gray-700 font-bold">{movie.releaseDate}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] text-sm md:text-md items-center">
                    <span className="font-black text-[#333]">{t("rated")}:</span>
                    <span className="text-gray-700 font-black flex items-center gap-2">
                        <Chip className={`${movie.rating === 'P' ? 'bg-green-600' : 'bg-red-600'} text-white font-black h-6`} size="sm" radius="none">{movie.rating}</Chip>
                        <span className="text-[11px] uppercase ml-1">
                            {movie.rating === 'P' ? t("rating-P") : t("rating-T", { age: movie.rating.replace('T', '') })}
                        </span>
                    </span>
                </div>
              </div>
              <div className="pt-6">
                <Button onClick={() => setIsBookingOpen(true)} className="bg-[#e71a0f] text-white font-black px-8 h-[44px] min-w-[150px] shadow-[0px_4px_0px_#a3120a] border border-black/10 hover:brightness-110 active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase" radius="sm">
                    🎫 {t("buy-ticket")}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-8">
             <div className="flex items-center justify-center">
                 <div className="relative bg-[#b11116] text-white py-3 px-16 font-black uppercase text-sm italic tracking-widest shadow-xl flex items-center gap-4">
                    <span>{t("details")}</span>
                    <span className="text-white/40 font-normal">|</span>
                    <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-yellow-400 transition-colors flex items-center gap-2">
                        {t("trailer")} <span className="text-[10px] transform translate-y-[1px]">↗</span>
                    </a>
                    <div className="absolute top-0 -left-6 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[24px] border-r-[#b11116]" />
                    <div className="absolute top-0 -right-6 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[24px] border-l-[#b11116]" />
                 </div>
             </div>
             <div className="bg-white/50 p-6 border-l-4 border-[#b11116]">
                <p className="text-gray-700 leading-7 text-[15px] font-medium">
                    {movie.title === "QUỶ NHẬP TRÀNG 2" ?
                    t("movie-description-1") :
                    t("movie-description-2")}
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)}></div>
            <div className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] bg-[#fdfcf0] shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#222] text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest">
                            {bookingStep === "schedule" ? t("select-showtime") : bookingStep === "combos" ? t("popcorn-drinks") : bookingStep === "payment" ? t("payment") : t("booking-online")}
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
                    {bookingStep === "schedule" ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white/50 border-y border-[#333] py-4 px-6 flex items-center justify-center gap-1 overflow-x-auto hide-scrollbar">
                                {dates.map((d, index) => (
                                    <div key={index} onClick={() => setSelectedDay(d.day)} className={`flex flex-col items-center justify-center min-w-[64px] h-16 cursor-pointer transition-all relative rounded-sm ${selectedDay === d.day ? 'bg-black text-white scale-110 z-10' : 'bg-[#e1e1e1] text-[#666] hover:bg-gray-300'}`}>
                                        {index < 3 && selectedDay !== d.day && <div className="absolute top-1 right-1 w-2 h-2 bg-[#e71a0f] rounded-full border border-white"></div>}
                                        <span className="text-[10px] font-black">{d.weekday}</span>
                                        <span className="text-xl font-black">{d.day}</span>
                                        <span className="text-[9px] font-bold underline">{d.month}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-4 flex gap-4 border-b border-gray-200 bg-white">
                                {Object.keys(cinemasByRegion).map(reg => (
                                    <Button key={reg} size="sm" radius="none" onClick={() => setSelectedRegion(reg)} className={`${selectedRegion === reg ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'} font-black px-4`}>{reg}</Button>
                                ))}
                            </div>
                            <div className="p-6 space-y-12">
                                {cinemasByRegion[selectedRegion].map((cinema, idx) => (
                                    <div key={idx} className="border-b border-gray-300 pb-10 last:border-0 text-black">
                                        <h4 className="text-[19px] font-black mb-4">{cinema.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cinema.formats[0].times.map((time) => (
                                                <Button key={time} onClick={() => { setSelectedCinema(cinema.name); setSelectedTime(time); setBookingStep("seats"); }} variant="bordered" radius="none" size="sm" className="border border-[#ccc] bg-white text-[#333] font-bold px-6 hover:border-red-600 hover:text-red-600">{time}</Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : bookingStep === "seats" ? (
                        <div className="bg-white p-6 flex flex-col items-center min-h-[500px] animate-in fade-in duration-300">
                            <div className="w-full max-w-3xl mb-12">
                                <div className="text-center font-bold text-gray-400 mb-2 tracking-[1em] uppercase">{t("select-seat")}</div>
                                <div className="border-t-8 border-gray-300 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] pt-4 text-center">
                                    <h4 className="text-2xl font-black text-gray-400 tracking-[0.5em] uppercase">{t("screen")}</h4>
                                </div>
                            </div>
                            {renderSeatGrid()}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12 mt-8 text-xs font-bold text-gray-600 uppercase border-t pt-8 w-full max-w-2xl">
                                <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#b11116] border-2 border-[#b11116]"></div> {t("selected")}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-green-500"></div> {t("available")}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 bg-gray-400 border-2 border-gray-400"></div> {t("sold")}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-red-500"></div> {t("vip")}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-pink-500 text-center leading-4 text-[10px]">X</div> {t("cannot-pick")}</div>
                                <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-pink-500"></div> {t("sweetbox")}</div>
                            </div>
                        </div>
                    ) : bookingStep === "combos" ? (
                        <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
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
                    ) : (
                        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
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
                        <div onClick={handlePrevious} className="cursor-pointer bg-[#333] hover:bg-black p-4 flex flex-col items-center justify-center transition-all min-w-[100px] border border-gray-700">
                            <span className="text-3xl">←</span>
                            <span className="text-[10px] font-black uppercase">{t("previous")}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                            <img src={movie.image} className="w-16 h-24 object-cover border border-white/20" />
                            <div className="min-w-0">
                                <h4 className="font-black text-yellow-500 uppercase truncate text-sm md:text-base">{movie.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400">2D | {movie.rating}</p>
                            </div>
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-bold min-w-[300px] px-4 border-x border-gray-800 items-center">
                            <div className="text-gray-500 uppercase">{t("cinemas")}</div><div className="text-white truncate">{selectedCinema}</div>
                            <div className="text-gray-500 uppercase text-[9px] leading-tight">{t("showtime")}</div>
                            <div className="text-white text-[10px]">{selectedTime}, {selectedDay}/03/2026</div>
                            <div className="text-gray-500 uppercase">{t("select-seat")}</div>
                            <div className="text-yellow-500 font-black text-[10px]">{renderSeatSummary()}</div>
                        </div>
                        <div className="flex flex-col justify-center text-right min-w-[150px] px-4">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("total")}</div>
                            <div className="text-2xl font-black text-white leading-none mt-1">{calculateTotal().toLocaleString("vi-VN")} đ</div>
                        </div>
                        <div onClick={handleNext} className="cursor-pointer bg-[#e71a0f] hover:brightness-110 p-4 flex flex-col items-center justify-center transition-all min-w-[120px] shadow-[0px_-2px_10px_rgba(231,26,15,0.4)]">
                            <span className="text-3xl">→</span>
                            <span className="text-[10px] font-black uppercase">{bookingStep === "payment" ? t("pay-now") : t("next")}</span>
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
