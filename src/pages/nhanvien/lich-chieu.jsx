import { useState } from "react";
import AdminLayout from "@/layouts/admin";

const ROOMS = ["Phòng 1", "Phòng 2", "Phòng 3"];

const SCHEDULE = {
  "Phòng 1": [
    { time: "08:30", end: "10:36", movie: "QUỶ NHẬP TRÀNG 2",     status: "done",    seats: 120, sold: 112 },
    { time: "11:00", end: "13:06", movie: "QUỶ NHẬP TRÀNG 2",     status: "done",    seats: 120, sold: 98 },
    { time: "13:30", end: "15:36", movie: "QUỶ NHẬP TRÀNG 2",     status: "ongoing", seats: 120, sold: 105 },
    { time: "16:00", end: "18:06", movie: "THOÁT KHỎI TẬN THẾ",   status: "open",    seats: 120, sold: 44 },
    { time: "18:30", end: "21:07", movie: "THOÁT KHỎI TẬN THẾ",   status: "open",    seats: 120, sold: 60 },
    { time: "21:30", end: "23:36", movie: "QUỶ NHẬP TRÀNG 2",     status: "open",    seats: 120, sold: 20 },
  ],
  "Phòng 2": [
    { time: "09:00", end: "10:45", movie: "CÚ NHẢY KỲ DIỆU",      status: "done",    seats: 80, sold: 72 },
    { time: "11:00", end: "12:45", movie: "ĐÊM NGÀY XA MẸ",       status: "done",    seats: 80, sold: 55 },
    { time: "13:00", end: "14:45", movie: "CÚ NHẢY KỲ DIỆU",      status: "done",    seats: 80, sold: 80 },
    { time: "15:00", end: "16:45", movie: "CÚ NHẢY KỲ DIỆU",      status: "ongoing", seats: 80, sold: 78 },
    { time: "17:00", end: "18:49", movie: "ĐÊM NGÀY XA MẸ",       status: "open",    seats: 80, sold: 30 },
    { time: "19:00", end: "20:49", movie: "ĐÊM NGÀY XA MẸ",       status: "open",    seats: 80, sold: 50 },
  ],
  "Phòng 3": [
    { time: "10:00", end: "11:55", movie: "SIÊU TRỘM QUYẾT CHIẾN", status: "done",    seats: 60, sold: 48 },
    { time: "12:30", end: "14:25", movie: "SIÊU TRỘM QUYẾT CHIẾN", status: "done",    seats: 60, sold: 60 },
    { time: "15:00", end: "16:55", movie: "SIÊU TRỘM QUYẾT CHIẾN", status: "ongoing", seats: 60, sold: 55 },
    { time: "17:30", end: "19:25", movie: "SIÊU TRỘM QUYẾT CHIẾN", status: "open",    seats: 60, sold: 20 },
    { time: "20:00", end: "21:55", movie: "SIÊU TRỘM QUYẾT CHIẾN", status: "open",    seats: 60, sold: 10 },
  ],
};

const STATUS_STYLE = {
  done:    { label: "Đã chiếu", cls: "bg-white/10 text-white/40",                  dotCls: "bg-white/30" },
  ongoing: { label: "Đang chiếu", cls: "bg-emerald-900/40 border border-emerald-500/40 text-emerald-300", dotCls: "bg-emerald-400 animate-pulse" },
  open:    { label: "Sắp chiếu", cls: "bg-blue-900/20 border border-blue-500/20 text-blue-300",          dotCls: "bg-blue-400" },
};

export default function LichChieu() {
  const [selectedRoom, setSelectedRoom] = useState("Phòng 1");
  const shows = SCHEDULE[selectedRoom] ?? [];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Lịch Chiếu Hôm Nay</h1>
          <p className="text-white/50 text-sm mt-1">{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Room tabs */}
        <div className="flex gap-2">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedRoom === r ? "bg-[#b11116] text-white" : "bg-[#1e293b] text-white/50 hover:bg-white/10 border border-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {shows.map((s, i) => {
            const style = STATUS_STYLE[s.status];
            const occupancy = Math.round((s.sold / s.seats) * 100);
            return (
              <div key={i} className={`rounded-xl p-4 ${style.cls} transition-all`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dotCls}`}></span>
                    <div>
                      <p className="font-black text-sm">{s.time}</p>
                      <p className="text-xs opacity-50">{s.end}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{s.movie}</p>
                    <span className="text-[10px] font-bold opacity-60 uppercase">{style.label}</span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{s.sold}/{s.seats}</p>
                    <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${occupancy >= 90 ? "bg-red-500" : occupancy >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <p className="text-[10px] opacity-50 mt-0.5">{occupancy}% lấp đầy</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
