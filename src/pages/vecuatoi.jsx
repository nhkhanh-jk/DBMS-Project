import { useEffect, useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Chip } from "@heroui/chip";
import { apiRequest } from "@/utils/api";
import { useTranslation } from "react-i18next";

export default function VeCuaToiPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("ACTIVE");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiRequest(`/users/tickets?status=${tab}`)
      .then((res) => {
        const list = res?.items || (Array.isArray(res) ? res : (res?.data || []));
        setTickets(list.map(t => ({
            id: t._id || t.id,
            code: t.ticketCode || t.bookingCode || "---",
            movie: t.movieTitle || t.movie?.TenPhim || "---",
            cinema: t.cinemaName || t.cinema?.TenRap || "---",
            room: t.roomName || "---",
            seats: Array.isArray(t.seats) ? t.seats.join(", ") : (t.seatNumbers || t.ViTriGhe || "---"),
            time: t.startTime || t.showtime?.GioBatDau || "---",
            date: t.date || (t.showtime?.NgayChieu ? new Date(t.showtime.NgayChieu).toLocaleDateString("vi-VN") : "---"),
            status: t.status || t.TrangThai || "ACTIVE",
            poster: t.moviePoster || t.movie?.HinhAnh || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=200&q=60"
        })));
      })
      .catch((e) => {
          console.error("Fetch tickets failed", e);
          setError(e.message || "Không tải được danh sách vé");
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-black uppercase mb-8 border-b-2 border-black pb-4">{t("my-tickets") || "Vé Của Tôi"}</h2>
          
          <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-sm w-fit">
            <button 
                onClick={() => setTab("ACTIVE")} 
                className={`px-6 py-2 text-sm font-black uppercase transition-all ${tab === "ACTIVE" ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black"}`}
            >
                {t("valid-tickets") || "Vé hiệu lực"}
            </button>
            <button 
                onClick={() => setTab("HISTORY")} 
                className={`px-6 py-2 text-sm font-black uppercase transition-all ${tab === "HISTORY" ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black"}`}
            >
                {t("history") || "Lịch sử"}
            </button>
          </div>

          {error && <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 text-red-600 font-bold uppercase tracking-tight">{error}</div>}
          
          {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Đang tải danh sách vé...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
                {tickets.map((ticket, idx) => (
                <div key={ticket.id || idx} className="flex flex-col md:flex-row bg-white border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    {/* Poster */}
                    <div className="w-full md:w-32 h-48 md:h-auto flex-shrink-0 bg-gray-100">
                        <img src={ticket.poster} alt={ticket.movie} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-6 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-[#b11116] uppercase leading-tight">{ticket.movie}</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{ticket.cinema}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Mã vé</p>
                                <p className="text-sm font-black font-mono">{ticket.code}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 mt-2">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Suất chiếu</p>
                                <p className="text-xs font-black">{ticket.time} | {ticket.date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Phòng & Ghế</p>
                                <p className="text-xs font-black">{ticket.room} | <span className="text-[#b11116]">{ticket.seats}</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</p>
                                <Chip 
                                    className="font-black text-[10px]" 
                                    color={ticket.status === "ACTIVE" ? "success" : "default"} 
                                    variant="flat" 
                                    size="sm"
                                    radius="none"
                                >
                                    {ticket.status === "ACTIVE" ? "HỢP LỆ" : "ĐÃ DÙNG/HẾT HẠN"}
                                </Chip>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorations */}
                    <div className="hidden md:block absolute left-[122px] -top-3 w-5 h-5 rounded-full bg-[#fcfbf7] border-2 border-black"></div>
                    <div className="hidden md:block absolute left-[122px] -bottom-3 w-5 h-5 rounded-full bg-[#fcfbf7] border-2 border-black"></div>
                </div>
                ))}
                
                {tickets.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Bạn chưa có vé nào trong mục này</p>
                        <p className="text-sm text-gray-400 mt-2 italic">Hãy đặt vé và cùng trải nghiệm phim hay tại TNC!</p>
                    </div>
                )}
            </div>
          )}
        </div>
      </section>
    </TNCLayout>
  );
}
