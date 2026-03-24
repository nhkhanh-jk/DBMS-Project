import { useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

export default function RapChiTietPage() {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState("23");

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
                <p><span className="font-bold">{t("address")}:</span> Tầng 4, TTTM Vincom Đà Nẵng, đường Ngô Quyền, P.An Hải Bắc, Q.Sơn Trà, TP. Đà Nẵng</p>
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
                            {format.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {format.times.map((time, tIdx) => (
                              <Button 
                                key={tIdx}
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
    </TNCLayout>
  );
}
