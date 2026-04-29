import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/staff";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { apiRequest } from "@/utils/api";

const STATUS_STYLE = {
  done:    { label: "Đã chiếu", cls: "bg-white/5 border border-white/5 opacity-60 hover:opacity-100",  dotCls: "bg-white/30" },
  ongoing: { label: "Đang chiếu", cls: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.1)]", dotCls: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" },
  open:    { label: "Sắp chiếu", cls: "bg-[#e71a0f]/10 border border-[#e71a0f]/20 text-[#ff4b4b]", dotCls: "bg-[#e71a0f] shadow-[0_0_8px_rgba(231,26,15,0.6)]" },
};

export default function LichChieu() {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayData = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("/staff/showtimes/today");
        const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
        
        const roomMap = {};
        data.forEach(s => {
            const roomName = s.roomName || s.TenPhong || s.room?.TenPhong || "Phòng không tên";
            if (!roomMap[roomName]) roomMap[roomName] = [];
            
            // Determine status based on time
            const now = new Date();
            const start = new Date(`${new Date().toDateString()} ${s.startTime || s.GioBatDau}`);
            const end = new Date(start.getTime() + (s.movie?.duration || 120) * 60000);
            
            let status = "open";
            if (now > end) status = "done";
            else if (now > start) status = "ongoing";

            roomMap[roomName].push({
                time: s.startTime || s.GioBatDau || "--:--",
                end: s.endTime || s.GioKetThuc || "--:--",
                movie: s.movie?.title || s.movie?.TenPhim || s.movieTitle || "Chưa có tên phim",
                status: status,
                seats: s.totalSeats || s.room?.totalSeats || 100,
                sold: s.soldSeats || s.bookedSeats || 0
            });
        });

        const roomNames = Object.keys(roomMap).sort();
        setRooms(roomNames);
        setSchedule(roomMap);
        if (roomNames.length > 0 && !selectedRoom) {
            setSelectedRoom(roomNames[0]);
        }
      } catch (err) {
        console.error("Failed to fetch today showtimes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayData();
  }, []);

  const shows = schedule[selectedRoom] ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white">Lịch Chiếu Hôm Nay</h1>
            <p className="text-[#e71a0f] text-sm mt-1 font-bold uppercase tracking-widest">{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        {/* Room tabs */}
        {rooms.length > 0 && (
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
            <Tabs 
              aria-label="Phòng chiếu" 
              selectedKey={selectedRoom} 
              onSelectionChange={(key) => setSelectedRoom(key)}
              variant="light"
              classNames={{
                cursor: "bg-[#e71a0f] shadow-md",
                tab: "h-10 px-6 font-bold text-white/50",
                tabContent: "group-data-[selected=true]:text-white font-black uppercase tracking-widest text-xs"
              }}
            >
              {rooms.map((r) => (
                <Tab key={r} title={r} />
              ))}
            </Tabs>
          </div>
        )}

        {/* Timeline */}
        <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-2xl">
          <CardHeader className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">{selectedRoom || "Đang tải..."}</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center text-white/20 italic">Đang tải lịch chiếu...</div>
              ) : shows.length > 0 ? (
                shows.map((s, i) => {
                  const style = STATUS_STYLE[s.status];
                  const occupancy = Math.round((s.sold / s.seats) * 100);
                  return (
                    <div key={i} className={`rounded-xl p-5 ${style.cls} transition-all hover:-translate-y-1 hover:shadow-xl`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex items-center gap-4 w-32 flex-shrink-0">
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${style.dotCls}`}></span>
                          <div>
                            <p className="font-black text-2xl text-white">{s.time}</p>
                            <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Đến {s.end}</p>
                          </div>
                        </div>

                        <div className="flex-1 w-full pl-6 border-l border-white/10">
                          <p className="font-black text-lg text-white truncate">{s.movie}</p>
                          <span className="text-[10px] font-black opacity-70 uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-sm mt-1 inline-block">{style.label}</span>
                        </div>

                        <div className="w-full sm:w-48 text-right flex-shrink-0 mt-4 sm:mt-0 p-3 bg-black/20 rounded-xl border border-white/5">
                          <p className="text-sm font-black text-white">{s.sold} / {s.seats} <span className="text-xs text-white/50 uppercase">Ghế</span></p>
                          <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${occupancy >= 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : occupancy >= 60 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]"}`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{occupancy}% Đầy</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-white/20 italic">Không có suất chiếu nào cho phòng này</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}

