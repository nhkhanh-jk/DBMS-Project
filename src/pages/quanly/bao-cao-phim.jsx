import ManagerLayout from "@/layouts/quanly";
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const BAR_COLORS = ["#b11116", "#e84c50", "#f47678", "#f9a8a9", "#fcd5d5"];
const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;

export default function BaoCaoPhim() {
  const [movieStats, setMovieStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieStats = async () => {
        setLoading(true);
        try {
            const res = await apiRequest("/manager/reports/movies");
            const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
            setMovieStats(data.map((m, i) => ({
                rank: i + 1,
                title: m.title || m.TenPhim || "---",
                genre: m.genre || m.TheLoai || "---",
                tickets: m.totalTickets || m.tickets || 0,
                revenue: m.totalRevenue || m.revenue || 0,
                rating: m.rating || 0,
                occupancy: m.occupancyRate || m.occupancy || 0
            })));
        } catch (err) {
            console.error("Failed to fetch movie reports", err);
        } finally {
            setLoading(false);
        }
    };
    fetchMovieStats();
  }, []);

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Báo Cáo Theo Phim</h1>
          <p className="text-white/50 text-sm mt-1">Hiệu quả kinh doanh từng phim · {new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</p>
        </div>

        {loading ? (
            <div className="py-20 text-center text-white/20 italic">Đang tải báo cáo...</div>
        ) : (
            <>
            {/* Podium top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {movieStats.slice(0, 3).map((m, i) => (
                <div key={m.rank} className={`bg-[#1e293b] rounded-xl p-4 border ${i === 0 ? "border-[#f6c344]/40" : "border-white/5"}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-black ${i === 0 ? "text-[#f6c344]" : "text-white/30"}`}>#{m.rank}</span>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{m.genre}</span>
                </div>
                <p className="text-xs font-black text-white leading-tight mb-3">{m.title}</p>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                    <span className="text-white/40">Vé bán</span>
                    <span className="font-bold text-white">{m.tickets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                    <span className="text-white/40">Doanh thu</span>
                    <span className="font-bold text-[#f6c344]">{m.revenue > 1000000 ? `${(m.revenue / 1000000).toFixed(0)}M₫` : `${(m.revenue / 1000).toFixed(0)}K₫`}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                    <span className="text-white/40">Lấp đầy</span>
                    <span className="font-bold text-emerald-400">{m.occupancy}%</span>
                    </div>
                </div>
                </div>
            ))}
            </div>

            {/* Bar chart - doanh thu */}
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Doanh thu theo phim</h3>
            <div className="h-[240px]">
                {movieStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movieStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="rank" tickFormatter={(v) => `#${v}`} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                            formatter={(v, name, props) => [`${v.toLocaleString("vi-VN")}₫`, props.payload.title]}
                            labelFormatter={() => ""}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {movieStats.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-white/20 italic">Chưa có dữ liệu đồ thị</div>
                )}
            </div>
            </div>

            {/* Full table */}
            <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
            <div className="px-5 py-3 border-b border-white/10">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Bảng chi tiết tất cả phim</h3>
            </div>
            <table className="w-full text-sm">
                <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">#</th>
                    <th className="text-left px-5 py-3">Tên phim</th>
                    <th className="text-right px-5 py-3">Vé bán</th>
                    <th className="text-right px-5 py-3">Doanh thu</th>
                    <th className="text-right px-5 py-3">Lấp đầy TB</th>
                </tr>
                </thead>
                <tbody>
                {movieStats.map((m) => (
                    <tr key={m.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                        <span className={`font-black ${m.rank === 1 ? "text-[#f6c344]" : "text-white/40"}`}>#{m.rank}</span>
                    </td>
                    <td className="px-5 py-3.5">
                        <p className="font-bold text-white">{m.title}</p>
                        <p className="text-xs text-white/40">{m.genre}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-white">{m.tickets.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#f6c344]">{m.revenue.toLocaleString("vi-VN")}₫</td>
                    <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#b11116] rounded-full" style={{ width: `${m.occupancy}%` }} />
                        </div>
                        <span className="text-white/70 text-xs w-8">{m.occupancy}%</span>
                        </div>
                    </td>
                    </tr>
                ))}
                {movieStats.length === 0 && (
                    <tr><td colSpan="5" className="py-20 text-center text-white/20 italic">Chưa có dữ liệu phim</td></tr>
                )}
                </tbody>
            </table>
            </div>
            </>
        )}
      </div>
    </ManagerLayout>
  );
}

