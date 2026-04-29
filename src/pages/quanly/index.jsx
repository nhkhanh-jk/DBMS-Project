import ManagerLayout from "@/layouts/quanly";
import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const PIE_COLORS = ["#b11116", "#f6c344", "#3b82f6"];

const fmtVND = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  return `${(v / 1000).toFixed(0)}K`;
};

export default function ManagerDashboard() {
  const [kpis, setKpis] = useState([
    { id: "revenue", label: "Doanh thu",   value: "...", change: "Đang tải...", up: true },
    { id: "tickets", label: "Tổng vé bán",      value: "...",   change: "Đang tải...",  up: true },
    { id: "customers", label: "Khách hàng mới",    value: "...",   change: "Đang tải...",  up: true },
    { id: "occupancy", label: "Tỷ lệ lấp đầy", value: "...",  change: "Đang tải...",  up: false },
  ]);

  const [revenueData, setRevenueData] = useState([]);
  const [movieData, setMovieData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summary, revenue, movies, cinemas] = await Promise.all([
          apiRequest("/manager/reports/summary").catch(() => null),
          apiRequest("/manager/reports/revenue?view=weekly").catch(() => []),
          apiRequest("/manager/reports/movies").catch(() => []),
          apiRequest("/manager/reports/cinemas").catch(() => []),
        ]);

        if (summary) {
          setKpis([
            { id: "revenue", label: "Doanh thu", value: `${(summary.totalRevenue || 0).toLocaleString()}₫`, change: summary.revenueGrowth || "0%", up: !(summary.revenueGrowth?.startsWith("-")) },
            { id: "tickets", label: "Tổng vé bán", value: (summary.totalTickets || 0).toLocaleString(), change: summary.ticketGrowth || "0%", up: !(summary.ticketGrowth?.startsWith("-")) },
            { id: "customers", label: "Khách hàng mới", value: (summary.totalCustomers || 0).toLocaleString(), change: "Tháng này", up: true },
            { id: "occupancy", label: "Tỷ lệ lấp đầy", value: `${summary.avgOccupancy || 0}%`, change: "Trung bình", up: true },
          ]);
        }

        // Map revenue data for LineChart
        const revItems = Array.isArray(revenue) ? revenue : (revenue?.items || []);
        setRevenueData(revItems.map(item => ({
          day: item.date || item.day || "---",
          revenue: item.totalRevenue || item.revenue || 0
        })));

        // Map movie data for BarChart
        const movItems = Array.isArray(movies) ? movies : (movies?.items || []);
        setMovieData(movItems.slice(0, 5).map(item => ({
          name: item.title || item.TenPhim || "---",
          tickets: item.totalTickets || item.tickets || 0
        })));

        // Map occupancy data for PieChart
        const cinItems = Array.isArray(cinemas) ? cinemas : (cinemas?.items || []);
        setOccupancyData(cinItems.slice(0, 3).map(item => ({
          name: item.name || item.TenRap || "---",
          value: item.occupancyRate || item.occupancy || 0
        })));

      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard Quản Lý</h1>
          <p className="text-white/50 text-sm mt-1">Dữ liệu kinh doanh thời gian thực</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <p className="text-xs text-white/50 font-semibold uppercase">{k.label}</p>
              <p className="text-2xl font-black text-white mt-1">{k.value}</p>
              <p className={`text-xs font-bold mt-1 ${k.up ? "text-emerald-400" : "text-red-400"}`}>
                {k.up ? "▲" : "▼"} {k.change}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Doanh thu thời gian qua</h3>
          <div className="h-[240px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="day" tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                    formatter={(v) => [`${v.toLocaleString("vi-VN")}₫`, "Doanh thu"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#b11116" strokeWidth={2.5} dot={{ fill: "#b11116", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 italic text-sm">Chưa có dữ liệu biểu đồ</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movie Bar Chart */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Vé bán theo phim</h3>
            <div className="h-[220px]">
              {movieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movieData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#ffffff70", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                      formatter={(v) => [v.toLocaleString("vi-VN"), "Vé"]}
                    />
                    <Bar dataKey="tickets" fill="#f6c344" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 italic text-sm">Chưa có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Tỷ lệ lấp đầy theo rạp</h3>
            <div className="h-[220px]">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={{ stroke: "#ffffff30" }}
                    >
                      {occupancyData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                      formatter={(v) => [`${v}%`, "Lấp đầy"]}
                    />
                    <Legend wrapperStyle={{ color: "#ffffff80", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 italic text-sm">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}

