import AdminLayout from "@/layouts/admin";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";

const initialStats = [
  { id: "users", label: "Tổng người dùng", value: "...", change: "Đang tải...", icon: "👥", color: "from-blue-600 to-blue-400" },
  { id: "movies", label: "Phim hệ thống",  value: "...",    change: "Đang tải...",  icon: "🎬", color: "from-purple-600 to-purple-400" },
  { id: "cinemas", label: "Rạp chiếu",        value: "...",     change: "Đang tải...",  icon: "🏛️", color: "from-amber-600 to-amber-400" },
  { id: "staffs", label: "Nhân viên",        value: "...",     change: "Đang tải...",  icon: "🪪", color: "from-emerald-600 to-emerald-400" },
];

const recentActivities = [
  { time: "Vừa xong", action: "Hệ thống đã sẵn sàng", detail: "Dữ liệu được cập nhật từ API" },
  { time: "Hôm nay", action: "Kiểm tra bảo mật",     detail: "Hoàn thành quét định kỳ" },
];

const quickLinks = [
  { to: "/admin/nguoidung", label: "Quản lý người dùng", icon: "👥" },
  { to: "/admin/phim",      label: "Quản lý phim",       icon: "🎬" },
  { to: "/admin/rap",       label: "Quản lý rạp",        icon: "🏛️" },
  { to: "/admin/nhanvien",  label: "Quản lý nhân viên",  icon: "🪪" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, movies, cinemas, staffs] = await Promise.all([
          apiRequest("/admin/users").catch(() => ({ data: [] })),
          apiRequest("/admin/movies").catch(() => ({ data: [] })),
          apiRequest("/admin/cinemas").catch(() => ({ data: [] })),
          apiRequest("/admin/staffs").catch(() => ({ data: [] })),
        ]);

        const getCount = (res) => {
          if (Array.isArray(res)) return res.length;
          if (Array.isArray(res?.data)) return res.data.length;
          if (typeof res?.total === 'number') return res.total;
          return 0;
        };

        setStats([
          { ...initialStats[0], value: getCount(users).toLocaleString(), change: "Cập nhật trực tiếp" },
          { ...initialStats[1], value: getCount(movies).toLocaleString(), change: "Toàn hệ thống" },
          { ...initialStats[2], value: getCount(cinemas).toLocaleString(), change: "Đang hoạt động" },
          { ...initialStats[3], value: getCount(staffs).toLocaleString(), change: "Đã xác thực" },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

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
            <div key={s.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
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
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Hệ thống</h3>
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
