import AdminLayout from "@/layouts/admin";
import { Link } from "react-router-dom";

const stats = [
  { label: "Tổng người dùng", value: "1,284", change: "+24 tuần này", icon: "👥", color: "from-blue-600 to-blue-400" },
  { label: "Phim đang chiếu",  value: "12",    change: "3 sắp ra mắt",  icon: "🎬", color: "from-purple-600 to-purple-400" },
  { label: "Rạp chiếu",        value: "8",     change: "2 tỉnh thành",  icon: "🏛️", color: "from-amber-600 to-amber-400" },
  { label: "Nhân viên",        value: "47",    change: "+2 tháng này",  icon: "🪪", color: "from-emerald-600 to-emerald-400" },
];

const recentActivities = [
  { time: "09:12", action: "Người dùng mới đăng ký", detail: "nguyenvanA@gmail.com" },
  { time: "09:05", action: "Phim mới được thêm",     detail: "QUỶ NHẬP TRÀNG 3" },
  { time: "08:47", action: "Nhân viên cập nhật",     detail: "Trần Thị B — đổi ca" },
  { time: "08:30", action: "Rạp Hà Nội cập nhật",   detail: "Phòng 3 bảo trì" },
  { time: "08:00", action: "Backup hệ thống",        detail: "Hoàn thành thành công" },
];

const quickLinks = [
  { to: "/admin/nguoidung", label: "Quản lý người dùng", icon: "👥" },
  { to: "/admin/phim",      label: "Quản lý phim",       icon: "🎬" },
  { to: "/admin/rap",       label: "Quản lý rạp",        icon: "🏛️" },
  { to: "/admin/nhanvien",  label: "Quản lý nhân viên",  icon: "🪪" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard Quản Trị</h1>
          <p className="text-white/50 text-sm mt-1">Tổng quan hệ thống TNC Cinema</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-black text-white mt-1">{s.value}</p>
                  <p className="text-xs text-white/40 mt-1">{s.change}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-lg`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Truy cập nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.to}
                  to={ql.to}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-[#b11116]/20 border border-white/5 hover:border-[#b11116]/40 transition-all group"
                >
                  <span className="text-2xl">{ql.icon}</span>
                  <span className="text-xs font-bold text-white/60 group-hover:text-white text-center transition-colors">{ql.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-2 bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/30 font-mono pt-0.5 w-10 flex-shrink-0">{a.time}</span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{a.action}</p>
                    <p className="text-xs text-white/40">{a.detail}</p>
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
