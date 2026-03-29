import AdminLayout from "@/layouts/admin";
import { Link } from "react-router-dom";

const todayStats = [
  { label: "Vé đã bán hôm nay", value: "143", icon: "🎟️", color: "from-blue-600 to-blue-400" },
  { label: "Doanh thu ca",       value: "8.6M₫", icon: "💵", color: "from-emerald-600 to-emerald-400" },
  { label: "Suất chiếu còn lại", value: "6",    icon: "📽️", color: "from-purple-600 to-purple-400" },
  { label: "Khách chờ",          value: "12",   icon: "🧍", color: "from-amber-600 to-amber-400" },
];

const upcomingShows = [
  { time: "14:00", movie: "QUỶ NHẬP TRÀNG 2",    room: "Phòng 1", seats: "45/120", status: "open" },
  { time: "14:30", movie: "CÚ NHẢY KỲ DIỆU",     room: "Phòng 2", seats: "60/80",  status: "open" },
  { time: "15:00", movie: "THOÁT KHỎI TẬN THẾ",  room: "Phòng 3", seats: "30/60",  status: "open" },
  { time: "16:45", movie: "ĐÊM NGÀY XA MẸ",      room: "Phòng 1", seats: "10/120", status: "open" },
  { time: "17:00", movie: "SIÊU TRỘM QUYẾT CHIẾN",room: "Phòng 2",seats: "0/80",   status: "full" },
];

const quickLinks = [
  { to: "/nhanvien/ban-ve",      label: "Bán vé tại quầy",  icon: "🎟️" },
  { to: "/nhanvien/kiem-tra-ve", label: "Kiểm tra vé",      icon: "✅" },
  { to: "/nhanvien/lich-chieu",  label: "Xem lịch chiếu",   icon: "📅" },
];

export default function StaffDashboard() {
  const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const raw = localStorage.getItem("tnc_user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Xin chào, {user?.name ?? "Nhân viên"}!</h1>
          <p className="text-white/50 text-sm mt-1">Ca làm việc hôm nay · {new Date().toLocaleDateString("vi-VN")} · {now}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {todayStats.map((s) => (
            <div key={s.label} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/50 font-semibold">{s.label}</p>
                  <p className="text-2xl font-black text-white mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.to}
                  to={ql.to}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#b11116]/20 border border-white/5 hover:border-[#b11116]/40 transition-all group"
                >
                  <span className="text-xl">{ql.icon}</span>
                  <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{ql.label}</span>
                  <span className="ml-auto text-white/20 group-hover:text-white/60 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming shows */}
          <div className="lg:col-span-2 bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Suất chiếu sắp tới</h3>
            <div className="space-y-2">
              {upcomingShows.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm font-black text-[#f6c344] w-12 flex-shrink-0">{s.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{s.movie}</p>
                    <p className="text-xs text-white/40">{s.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">{s.seats}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === "full" ? "bg-red-900/50 text-red-400" : "bg-emerald-900/50 text-emerald-400"}`}>
                      {s.status === "full" ? "Hết vé" : "Còn vé"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
