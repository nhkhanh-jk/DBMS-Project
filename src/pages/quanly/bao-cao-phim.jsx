import AdminLayout from "@/layouts/admin";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const MOVIE_STATS = [
  { rank: 1, title: "QUỶ NHẬP TRÀNG 2",       genre: "Kinh Dị",   tickets: 3812, revenue: 342000000, rating: 8.4, occupancy: 91 },
  { rank: 2, title: "CÚ NHẢY KỲ DIỆU",        genre: "Gia đình",  tickets: 2450, revenue: 220500000, rating: 7.9, occupancy: 78 },
  { rank: 3, title: "THOÁT KHỎI TẬN THẾ",     genre: "Viễn Tưởng",tickets: 1890, revenue: 170100000, rating: 7.2, occupancy: 65 },
  { rank: 4, title: "ĐÊM NGÀY XA MẸ",         genre: "Gia đình",  tickets: 1340, revenue: 120600000, rating: 7.5, occupancy: 55 },
  { rank: 5, title: "SIÊU TRỘM QUYẾT CHIẾN",  genre: "Hành Động", tickets: 980,  revenue: 88200000,  rating: 7.8, occupancy: 62 },
];

const BAR_COLORS = ["#b11116", "#e84c50", "#f47678", "#f9a8a9", "#fcd5d5"];
const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;

export default function BaoCaoPhim() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Báo Cáo Theo Phim</h1>
          <p className="text-white/50 text-sm mt-1">Hiệu quả kinh doanh từng phim · Tháng 3/2026</p>
        </div>

        {/* Podium top 3 */}
        <div className="grid grid-cols-3 gap-4">
          {MOVIE_STATS.slice(0, 3).map((m, i) => (
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
                  <span className="font-bold text-[#f6c344]">{(m.revenue / 1000000).toFixed(0)}M₫</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Rating</span>
                  <span className="font-bold text-emerald-400">⭐ {m.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart - doanh thu */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">Doanh thu theo phim</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOVIE_STATS} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="rank" tickFormatter={(v) => `#${v}`} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                formatter={(v, name, props) => [`${v.toLocaleString("vi-VN")}₫`, props.payload.title]}
                labelFormatter={() => ""}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {MOVIE_STATS.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
                <th className="text-right px-5 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {MOVIE_STATS.map((m) => (
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
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-400">⭐ {m.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
