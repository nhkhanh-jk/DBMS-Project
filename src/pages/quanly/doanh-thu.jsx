import { useState } from "react";
import AdminLayout from "@/layouts/admin";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const WEEKLY_DATA = [
  { week: "Tuần 1 (01/03)", revenue: 312000000, tickets: 3467, prev: 285000000 },
  { week: "Tuần 2 (08/03)", revenue: 278500000, tickets: 3095, prev: 312000000 },
  { week: "Tuần 3 (15/03)", revenue: 395000000, tickets: 4388, prev: 278500000 },
  { week: "Tuần 4 (22/03)", revenue: 427200000, tickets: 4747, prev: 395000000 },
];

const MONTHLY_DATA = [
  { month: "T10/2025", revenue: 1020000000, tickets: 11333 },
  { month: "T11/2025", revenue: 980000000,  tickets: 10888 },
  { month: "T12/2025", revenue: 1450000000, tickets: 16111 },
  { month: "T1/2026",  revenue: 1200000000, tickets: 13333 },
  { month: "T2/2026",  revenue: 890000000,  tickets: 9888  },
  { month: "T3/2026",  revenue: 1412700000, tickets: 15696 },
];

const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;
const fmtFull = (v) => `${v.toLocaleString("vi-VN")}₫`;

const TABLE_ROWS_WEEKLY = [
  { period: "Tuần 1 (01–07/03)", revenue: 312000000, tickets: 3467, avg: 90000,  growth: "+9.5%" },
  { period: "Tuần 2 (08–14/03)", revenue: 278500000, tickets: 3095, avg: 90000,  growth: "-10.7%" },
  { period: "Tuần 3 (15–21/03)", revenue: 395000000, tickets: 4388, avg: 90000,  growth: "+41.8%" },
  { period: "Tuần 4 (22–25/03)", revenue: 427200000, tickets: 4747, avg: 90000,  growth: "+8.1%" },
];

export default function DoanhThu() {
  const [view, setView] = useState("weekly");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Báo Cáo Doanh Thu</h1>
            <p className="text-white/50 text-sm mt-1">Tháng 3/2026</p>
          </div>
          <div className="flex gap-2">
            {[["weekly", "Tuần"], ["monthly", "Tháng"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === v ? "bg-[#b11116] text-white" : "bg-[#1e293b] text-white/50 border border-white/5 hover:bg-white/10"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Area chart */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
            Doanh thu theo {view === "weekly" ? "tuần" : "tháng"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={view === "weekly" ? WEEKLY_DATA : MONTHLY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#b11116" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#b11116" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey={view === "weekly" ? "week" : "month"} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                formatter={(v) => [fmtFull(v), "Doanh thu"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#b11116" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison bar chart (weekly only) */}
        {view === "weekly" && (
          <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">So sánh tuần hiện tại vs tuần trước</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="week" tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                  formatter={(v) => [fmtFull(v)]}
                />
                <Legend wrapperStyle={{ color: "#ffffff80", fontSize: 12 }} />
                <Bar dataKey="revenue" name="Tuần hiện tại" fill="#b11116" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prev"    name="Tuần trước"    fill="#ffffff30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
          <div className="px-5 py-3 border-b border-white/10">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Chi tiết theo tuần</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Kỳ</th>
                <th className="text-right px-5 py-3">Doanh thu</th>
                <th className="text-right px-5 py-3">Số vé</th>
                <th className="text-right px-5 py-3">Giá TB/vé</th>
                <th className="text-right px-5 py-3">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS_WEEKLY.map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-white">{r.period}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#f6c344]">{fmtFull(r.revenue)}</td>
                  <td className="px-5 py-3.5 text-right text-white/70">{r.tickets.toLocaleString("vi-VN")}</td>
                  <td className="px-5 py-3.5 text-right text-white/70">{fmtFull(r.avg)}</td>
                  <td className={`px-5 py-3.5 text-right font-bold ${r.growth.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{r.growth}</td>
                </tr>
              ))}
              <tr className="bg-white/5">
                <td className="px-5 py-3.5 font-black text-white">Tổng tháng 3</td>
                <td className="px-5 py-3.5 text-right font-black text-[#f6c344]">1,412,700,000₫</td>
                <td className="px-5 py-3.5 text-right font-bold text-white">15,697</td>
                <td className="px-5 py-3.5 text-right text-white/70">90,000₫</td>
                <td className="px-5 py-3.5 text-right font-bold text-emerald-400">+23.4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
