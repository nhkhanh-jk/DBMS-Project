import AdminLayout from "@/layouts/staff";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";

export default function StaffDashboard() {
  const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const raw = localStorage.getItem("tnc_user");
  const user = raw ? JSON.parse(raw) : null;

  const [stats, setStats] = useState([
    { label: "Vé đã bán hôm nay", value: "...", text: "VÉ", color: "from-blue-600 to-blue-400" },
    { label: "Doanh thu ca",       value: "...", text: "DT", color: "from-emerald-600 to-emerald-400" },
    { label: "Suất chiếu còn lại", value: "...", text: "SC", color: "from-purple-600 to-purple-400" },
    { label: "Số lượng phim",      value: "...", text: "PH", color: "from-amber-600 to-amber-400" },
  ]);

  const [upcomingShows, setUpcomingShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiRequest("/staff/showtimes/today");
            const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
            
            const now = new Date();
            const upcoming = data.filter(s => {
                const start = new Date(`${new Date().toDateString()} ${s.startTime || s.GioBatDau}`);
                return start > now;
            }).sort((a, b) => (a.startTime || a.GioBatDau).localeCompare(b.startTime || b.GioBatDau));

            setUpcomingShows(upcoming.slice(0, 5).map(s => ({
                time: s.startTime || s.GioBatDau || "--:--",
                movie: s.movie?.title || s.movie?.TenPhim || "---",
                room: s.roomName || s.TenPhong || s.room?.TenPhong || "---",
                seats: `${s.soldSeats || 0}/${s.totalSeats || 100}`,
                status: (s.soldSeats || 0) >= (s.totalSeats || 100) ? "full" : "open"
            })));

            // Derive stats
            const totalSold = data.reduce((sum, s) => sum + (s.soldSeats || 0), 0);
            const totalRevenue = data.reduce((sum, s) => sum + (s.revenue || 0), 0);
            const remaining = data.filter(s => {
                const start = new Date(`${new Date().toDateString()} ${s.startTime || s.GioBatDau}`);
                return start > now;
            }).length;
            const uniqueMovies = new Set(data.map(s => s.movieId || s.movie?.id || s.movie?._id)).size;

            setStats([
                { label: "Vé đã bán hôm nay", value: totalSold.toLocaleString(), text: "VÉ", color: "from-blue-600 to-blue-400" },
                { label: "Doanh thu hôm nay",  value: totalRevenue > 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}M₫` : `${(totalRevenue / 1000).toFixed(0)}K₫`, text: "DT", color: "from-emerald-600 to-emerald-400" },
                { label: "Suất chiếu sắp tới", value: remaining.toString(),    text: "SC", color: "from-purple-600 to-purple-400" },
                { label: "Số lượng phim",      value: uniqueMovies.toString(),   text: "PH", color: "from-amber-600 to-amber-400" },
            ]);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const quickLinks = [
    { to: "/nhanvien/ban-ve",      label: "Bán vé tại quầy POS" },
    { to: "/nhanvien/kiem-tra-ve", label: "Kiểm tra soát vé trực tuyến" },
    { to: "/nhanvien/lich-chieu",  label: "Quản lý lịch chiếu hôm nay" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-white">Xin chào, {user?.fullName || user?.name || "Nhân viên"}!</h1>
          <p className="text-white/50 text-sm mt-1">Ca làm việc hôm nay · {new Date().toLocaleDateString("vi-VN")} · {nowStr}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((s) => (
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
                  {loading ? (
                    <div className="py-10 text-center text-white/20 italic">Đang tải suất chiếu...</div>
                  ) : upcomingShows.length > 0 ? (
                    upcomingShows.map((s, i) => (
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
                      ))
                  ) : (
                    <div className="py-10 text-center text-white/20 italic">Không còn suất chiếu nào trong hôm nay</div>
                  )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

