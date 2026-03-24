import { useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Chip } from "@heroui/chip";
import { useTranslation } from "react-i18next";

export default function VeCuaToiPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("ACTIVE");

  const activeTickets = [
    {
        id: "TNC-88291038",
        movie: t("movie-1-title") || "QUỶ NHẬP TRÀNG 2",
        rating: "T18",
        cinema: "TNC Vincom Đà Nẵng",
        date: "MON 23/03/2026",
        time: "22:15",
        room: "Cinema 3",
        seat: "H12, H13",
        price: "240.000đ",
        poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const pastTickets = [
    {
        id: "TNC-77210923",
        movie: t("movie-2-title") || "MAI",
        rating: "T18",
        cinema: "TNC Vincom City Hub",
        date: "SUN 15/03/2026",
        time: "19:00",
        room: "Cinema 1",
        seat: "F08",
        price: "110.000đ",
        poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const currentList = tab === "ACTIVE" ? activeTickets : pastTickets;

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          
          {/* Header */}
          <div className="flex items-center justify-center mb-10">
            <hr className="flex-grow border-gray-400" />
            <h2 
              className="mx-6 text-4xl font-black uppercase tracking-[0.2em] font-serif text-[#333]" 
              style={{ textShadow: "2px 2px 0 #fff, 3px 3px 0 #ccc" }}
            >
              {t("my-tickets")}
            </h2>
            <hr className="flex-grow border-gray-400" />
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12 text-[13px]">
            <div className="flex bg-[#e1e1e1] p-1 rounded-sm shadow-inner">
                <button 
                    onClick={() => setTab("ACTIVE")}
                    className={`px-8 py-2 font-black uppercase tracking-wider transition-all
                        ${tab === "ACTIVE" ? "bg-[#b11116] text-white shadow-md" : "text-[#666] hover:text-black"} `}
                >
                    {t("active-tickets")}
                </button>
                <button 
                    onClick={() => setTab("HISTORY")}
                    className={`px-8 py-2 font-black uppercase tracking-wider transition-all
                        ${tab === "HISTORY" ? "bg-[#b11116] text-white shadow-md" : "text-[#666] hover:text-black"} `}
                >
                    {t("my-bookings")}
                </button>
            </div>
          </div>

          {/* Ticket List */}
          <div className="space-y-12 max-w-4xl mx-auto">
            {currentList.length > 0 ? (
                currentList.map((t_item, idx) => (
                    <div key={idx} className="space-y-4">
                        {/* THE DISPLAY TICKET CONTAINER */}
                        <div 
                            className="flex flex-col md:flex-row bg-white border border-gray-200 shadow-xl relative overflow-hidden group rounded-sm"
                        >
                            {/* Decorative Perforation Left */}
                            <div className="hidden md:block absolute left-[128px] top-0 bottom-0 w-px border-l-2 border-dashed border-gray-100 z-10"></div>
                            
                            {/* Movie Poster Section */}
                            <div className="w-full md:w-32 h-48 md:h-auto bg-[#eee] flex-shrink-0">
                                <img 
                                    src={t_item.poster} 
                                    alt={t_item.movie} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                            </div>

                            {/* Main Info Section */}
                            <div className="flex-grow p-6 md:pl-10 space-y-4 flex flex-col justify-center bg-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-[#b11116] leading-none mb-2">{t_item.movie}</h4>
                                        <Chip className="bg-[#b11116] text-white font-black" radius="none" size="sm">{t_item.rating}</Chip>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("ticket-id")}</p>
                                        <p className="text-sm font-black text-[#333]">{t_item.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t("cinemas")}</p>
                                        <p className="text-[12px] font-bold text-[#444]">{t_item.cinema}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t("showtime")}</p>
                                        <p className="text-[12px] font-bold text-[#444]">{t_item.time} | {t_item.date.split(' ').slice(1).join(' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t("room-seat")}</p>
                                        <p className="text-[12px] font-bold text-[#444]">{t_item.room} | <span className="text-[#b11116]">{t_item.seat}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t("total")}</p>
                                        <p className="text-[13px] font-black text-[#333]">{t_item.price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Section */}
                            <div className="w-full md:w-36 bg-gray-50 border-t md:border-t-0 md:border-l border-dashed border-gray-200 flex flex-col items-center justify-center p-4 space-y-2 shrink-0">
                                <div className="w-20 h-20 bg-white border border-gray-200 p-1 shadow-inner flex items-center justify-center overflow-hidden">
                                     <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t_item.id}`} 
                                        alt="QR" 
                                        className="w-full h-full object-contain"
                                     />
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-[#b11116] uppercase tracking-tighter">{t("valid-until")}</p>
                                </div>
                            </div>

                            {/* Ticket Circles (Holes) */}
                            <div className="hidden md:block absolute left-[122px] -top-3 w-4 h-4 rounded-full bg-[#fcfbf7] border border-gray-200"></div>
                            <div className="hidden md:block absolute left-[122px] -bottom-3 w-4 h-4 rounded-full bg-[#fcfbf7] border border-gray-200"></div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-lg">
                    <span className="text-4xl block mb-4">🎫</span>
                    <p className="text-gray-400 font-medium italic">{t("no-tickets")}</p>
                </div>
            )}
          </div>

          <div className="mt-20 text-center">
            <p className="text-sm text-gray-500 italic mb-4">{t("hotline-support")}</p>
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
