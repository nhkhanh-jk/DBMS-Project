import AdminLayout from "@/layouts/admin";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const revenueData = [
  { day: "T2 19/3", revenue: 42000000, tickets: 467 },
  { day: "T3 20/3", revenue: 38500000, tickets: 428 },
  { day: "T4 21/3", revenue: 51000000, tickets: 567 },
  { day: "T5 22/3", revenue: 47200000, tickets: 524 },
  { day: "T6 23/3", revenue: 63800000, tickets: 709 },
  { day: "T7 24/3", revenue: 89500000, tickets: 994 },
  { day: "CN 25/3", revenue: 95200000, tickets: 1058 },
];

const movieData = [
  { name: "QUỶ NHẬP TRÀNG 2",      tickets: 3812, revenue: 342000000 },
  { name: "CÚ NHẢY KỲ DIỆU",       tickets: 2450, revenue: 220500000 },
  { name: "THOÁT KHỎI TẬN THẾ",    tickets: 1890, revenue: 170100000 },
  { name: "ĐÊM NGÀY XA MẸ",        tickets: 1340, revenue: 120600000 },
  { name: "SIÊU TRỘM QUYẾT CHIẾN", tickets: 980,  revenue: 88200000  },
];

const occupancyData = [
  { name: "Đà Nẵng",    value: 78 },
  { name: "Hà Nội",     value: 65 },
  { name: "TP.HCM",     value: 83 },
];

const PIE_COLORS = ["#b11116", "#f6c344", "#3b82f6"];

const kpis = [
  { label: "Doanh thu tuần",   value: "427.2M₫", change: "+12.4%", up: true },
  { label: "Tổng vé bán",      value: "4,747",   change: "+8.7%",  up: true },
  { label: "Khách hôm nay",    value: "1,058",   change: "+5.2%",  up: true },
  { label: "Tỷ lệ lấp đầy TB", value: "75.3%",  change: "-2.1%",  up: false },
];

const fmtVND = (v) => `${(v / 1000000).toFixed(1)}M`;

export default function ManagerDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard Quản Lý</h1>
          <p className="text-white/50 text-sm mt-1">Thống kê kinh doanh · Tuần 19–25/03/2026</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <p className="text-xs text-white/50 font-semibold uppercase">{k.label}</p>
              <p className="text-2xl font-black text-white mt-1">{k.value}</p>
              <p className={`text-xs font-bold mt-1 ${k.up ? "text-emerald-400" : "text-red-400"}`}>
                {k.up ? "▲" : "▼"} {k.change} so với tuần trước
              </p>
            </div>
          ))}
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Doanh thu 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={240}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movie Bar Chart */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Vé bán theo phim</h3>
            <ResponsiveContainer width="100%" height={220}>
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
          </div>

          {/* Pie Chart */}
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Tỷ lệ lấp đầy theo rạp</h3>
            <ResponsiveContainer width="100%" height={220}>
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
