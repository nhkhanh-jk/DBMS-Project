import ManagerLayout from "@/layouts/quanly";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

const CINEMA_STATS = [
  {
    id: 1, name: "TNC Landmark TP.HCM", city: "TP. Hồ Chí Minh",
    rooms: 4, seats: 430, revenue: 650000000, tickets: 7222,
    occupancy: 83,
    roomData: [
      { room: "Phòng 1 (Standard)", occupancy: 85 },
      { room: "Phòng 2 (VIP)",      occupancy: 88 },
      { room: "Phòng 3 (IMAX)",     occupancy: 79 },
      { room: "Phòng 4 (Premium)",  occupancy: 82 },
    ],
  },
  {
    id: 2, name: "TNC Vincom Đà Nẵng", city: "Đà Nẵng",
    rooms: 3, seats: 260, revenue: 420000000, tickets: 4667,
    occupancy: 78,
    roomData: [
      { room: "Phòng 1 (Standard)", occupancy: 82 },
      { room: "Phòng 2 (VIP)",      occupancy: 75 },
      { room: "Phòng 3 (IMAX)",     occupancy: 51 },
    ],
  },
  {
    id: 3, name: "TNC Vincom Hà Nội", city: "Hà Nội",
    rooms: 2, seats: 240, revenue: 342700000, tickets: 3807,
    occupancy: 65,
    roomData: [
      { room: "Phòng 1 (Standard)", occupancy: 68 },
      { room: "Phòng 2 (VIP)",      occupancy: 60 },
    ],
  },
];

const RADIAL_DATA = CINEMA_STATS.map((c, i) => ({
  name: c.name.replace("TNC ", ""),
  occupancy: c.occupancy,
  fill: ["#b11116", "#f6c344", "#3b82f6"][i],
}));

const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;

export default function BaoCaoRap() {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Báo Cáo Theo Rạp</h1>
          <p className="text-white/50 text-sm mt-1">Hiệu suất vận hành từng rạp · Tháng 3/2026</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CINEMA_STATS.map((c, i) => (
            <div key={c.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-white text-sm">{c.name}</p>
                  <p className="text-xs text-white/40">{c.city} · {c.rooms} phòng</p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ background: RADIAL_DATA[i].fill }}
                >
                  {c.occupancy}%
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Doanh thu</span>
                  <span className="font-bold text-[#f6c344]">{fmtVND(c.revenue)}M₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Vé bán</span>
                  <span className="font-bold text-white">{c.tickets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Lấp đầy TB</span>
                  <span className={`font-bold ${c.occupancy >= 80 ? "text-emerald-400" : c.occupancy >= 60 ? "text-amber-400" : "text-red-400"}`}>{c.occupancy}%</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${c.occupancy}%`, background: RADIAL_DATA[i].fill }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Radial bar chart */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-2">Tỷ lệ lấp đầy tổng thể</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={RADIAL_DATA}>
              <RadialBar
                minAngle={15}
                background={{ fill: "#ffffff08" }}
                clockWise
                dataKey="occupancy"
                label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: "bold" }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ color: "#ffffff80", fontSize: 12 }}
                formatter={(value) => value}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                formatter={(v) => [`${v}%`, "Lấp đầy"]}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-cinema room breakdown */}
        {CINEMA_STATS.map((c, ci) => (
          <div key={c.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
              {c.name} — Lấp đầy từng phòng
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={c.roomData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="room" width={150} tick={{ fill: "#ffffff70", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                  formatter={(v) => [`${v}%`, "Lấp đầy"]}
                />
                <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
                  {c.roomData.map((r) => (
                    <Cell
                      key={r.room}
                      fill={r.occupancy >= 80 ? "#10b981" : r.occupancy >= 60 ? "#f6c344" : "#b11116"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </ManagerLayout>
  );
}
