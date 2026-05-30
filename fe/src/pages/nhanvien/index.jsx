import AdminLayout from "@/layouts/staff";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

const todayStats = [
  { label: "Vé đã bán hôm nay", value: "143", text: "VÉ", color: "from-blue-600 to-blue-400" },
  { label: "Doanh thu ca",       value: "8.6M₫", text: "DT", color: "from-emerald-600 to-emerald-400" },
  { label: "Suất chiếu còn lại", value: "6",    text: "SC", color: "from-purple-600 to-purple-400" },
  { label: "Khách chờ",          value: "12",   text: "KC", color: "from-amber-600 to-amber-400" },
];

const upcomingShows = [
  { time: "14:00", movie: "QUỶ NHẬP TRÀNG 2",    room: "Phòng 1", seats: "45/120", status: "open" },
  { time: "14:30", movie: "CÚ NHẢY KỲ DIỆU",     room: "Phòng 2", seats: "60/80",  status: "open" },
  { time: "15:00", movie: "THOÁT KHỎI TẬN THẾ",  room: "Phòng 3", seats: "30/60",  status: "open" },
  { time: "16:45", movie: "ĐÊM NGÀY XA MẸ",      room: "Phòng 1", seats: "10/120", status: "open" },
  { time: "17:00", movie: "SIÊU TRỘM QUYẾT CHIẾN",room: "Phòng 2",seats: "0/80",   status: "full" },
];

const quickLinks = [
  { to: "/nhanvien/ban-ve",      label: "Bán vé tại quầy POS" },
  { to: "/nhanvien/kiem-tra-ve", label: "Kiểm tra soát vé trực tuyến" },
  { to: "/nhanvien/lich-chieu",  label: "Quản lý lịch chiếu hôm nay" },
];

export default function StaffDashboard() {
  const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const raw = localStorage.getItem("tnc_user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-white">Xin chào, {user?.name ?? "Nhân viên"}!</h1>
          <p className="text-white/50 text-sm mt-1">Ca làm việc hôm nay · {new Date().toLocaleDateString("vi-VN")} · {now}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {todayStats.map((s) => (
            <Card key={s.label} className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg hover:scale-[1.02] transition-transform">
              <CardBody className="p-5 overflow-hidden relative">
                <div className="flex items-start justify-between z-10 relative">
                  <div>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-black text-white mt-2">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-sm font-black shadow-inner`}>
                    {s.text}
                  </div>
                </div>
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${s.color} rounded-full opacity-10 blur-2xl`}></div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
            <CardHeader className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Thao tác nhanh</h3>
            </CardHeader>
            <CardBody className="px-6 py-4 space-y-3">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.to}
                  to={ql.to}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-[#e71a0f]/20 border border-white/5 hover:border-[#e71a0f]/40 transition-all group"
                >
                  <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wider">{ql.label}</span>
                  <span className="ml-auto text-white/20 group-hover:text-[#e71a0f] transition-colors font-bold group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </CardBody>
          </Card>

          {/* Upcoming shows */}
          <Card className="lg:col-span-2 bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
            <CardHeader className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Suất chiếu sắp tới</h3>
                <Link to="/nhanvien/lich-chieu" className="text-xs font-bold text-[#e71a0f] hover:underline">Xem toàn bộ</Link>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-white/5">
                  {upcomingShows.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="text-center w-14 flex-shrink-0">
                          <span className="text-lg font-black text-[#f6c344] leading-none">{s.time}</span>
                      </div>
                      <div className="flex-1 min-w-0 border-l border-white/10 pl-4">
                        <p className="text-sm font-black text-white truncate">{s.movie}</p>
                        <p className="text-xs font-bold text-white/40 mt-1 uppercase tracking-widest">{s.room}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-xs font-bold text-white/60">{s.seats}</p>
                        <Chip size="sm" radius="sm" className={`font-bold border-none ${s.status === "full" ? "bg-red-900/50 text-red-400" : "bg-emerald-900/50 text-emerald-400"}`}>
                          {s.status === "full" ? "Hết vé" : "Còn vé"}
                        </Chip>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
