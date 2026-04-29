import ManagerLayout from "@/layouts/quanly";
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;
const COLORS = ["#b11116", "#f6c344", "#3b82f6", "#10b981", "#8b5cf6"];

export default function BaoCaoRap() {
  const [cinemaStats, setCinemaStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemaStats = async () => {
        setLoading(true);
        try {
            const res = await apiRequest("/manager/reports/cinemas");
            const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
            setCinemaStats(data.map((c, i) => ({
                id: c.id || c._id || i,
                name: c.name || c.TenRap || "---",
                city: c.city || c.ThanhPho || "---",
                rooms: c.totalRooms || c.rooms || 0,
                seats: c.totalSeats || c.seats || 0,
                revenue: c.totalRevenue || c.revenue || 0,
                tickets: c.totalTickets || c.tickets || 0,
                occupancy: c.occupancyRate || c.occupancy || 0,
                roomData: (c.roomStats || c.roomData || []).map(r => ({
                    room: r.roomName || r.name || "---",
                    occupancy: r.occupancyRate || r.occupancy || 0
                })),
                fill: COLORS[i % COLORS.length]
            })));
        } catch (err) {
            console.error("Failed to fetch cinema reports", err);
        } finally {
            setLoading(false);
        }
    };
    fetchCinemaStats();
  }, []);

  const radialData = cinemaStats.map(c => ({
    name: c.name.replace("TNC ", ""),
    occupancy: c.occupancy,
    fill: c.fill
  }));

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Báo Cáo Theo Rạp</h1>
          <p className="text-white/50 text-sm mt-1">Hiệu suất vận hành từng rạp · {new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</p>
        </div>

        {loading ? (
            <div className="py-20 text-center text-white/20 italic">Đang tải báo cáo rạp...</div>
        ) : (
            <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cinemaStats.map((c) => (
                <div key={c.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                    <p className="font-black text-white text-sm">{c.name}</p>
                    <p className="text-xs text-white/40">{c.city} · {c.rooms} phòng</p>
                    </div>
                    <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                    style={{ background: c.fill }}
                    >
                    {c.occupancy}%
                    </div>
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                    <span className="text-white/40">Doanh thu</span>
                    <span className="font-bold text-[#f6c344]">{c.revenue > 1000000 ? `${(c.revenue / 1000000).toFixed(0)}M₫` : `${(c.revenue / 1000).toFixed(0)}K₫`}</span>
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
                    style={{ width: `${c.occupancy}%`, background: c.fill }}
                    />
                </div>
                </div>
            ))}
            </div>

            {/* Radial bar chart */}
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-2">Tỷ lệ lấp đầy tổng thể</h3>
            <div className="h-[260px]">
                {radialData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData}>
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
                ) : (
                    <div className="h-full flex items-center justify-center text-white/20 italic">Chưa có dữ liệu đồ thị</div>
                )}
            </div>
            </div>

            {/* Per-cinema room breakdown */}
            {cinemaStats.map((c) => c.roomData?.length > 0 && (
            <div key={c.id} className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
                {c.name} — Lấp đầy từng phòng
                </h3>
                <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={c.roomData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="room" width={150} tick={{ fill: "#ffffff70", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                        formatter={(v) => [`${v}%`, "Lấp đầy"]}
                        />
                        <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
                        {c.roomData.map((r, i) => (
                            <Cell
                            key={i}
                            fill={r.occupancy >= 80 ? "#10b981" : r.occupancy >= 60 ? "#f6c344" : "#b11116"}
                            />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            ))}
            </>
        )}
      </div>
    </ManagerLayout>
  );
}

