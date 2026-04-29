import { useState, useEffect } from "react";
import ManagerLayout from "@/layouts/quanly";
import { apiRequest } from "@/utils/api";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const fmtVND = (v) => `${(v / 1000000).toFixed(0)}M`;
const fmtFull = (v) => `${(v || 0).toLocaleString("vi-VN")}₫`;

export default function DoanhThu() {
  const [view, setView] = useState("weekly");
  const [revenueData, setRevenueData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const res = await apiRequest(`/manager/reports/revenue?view=${view}`);
            const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
            
            setRevenueData(data.map(item => ({
                label: item.period || item.date || item.month || "---",
                revenue: item.totalRevenue || item.revenue || 0,
                tickets: item.totalTickets || item.tickets || 0,
                prev: item.previousRevenue || 0
            })));

            setTableData(data.map(item => ({
                period: item.period || item.date || item.month || "---",
                revenue: item.totalRevenue || item.revenue || 0,
                tickets: item.totalTickets || item.tickets || 0,
                avg: item.avgTicketPrice || 90000,
                growth: item.growthRate || "0%"
            })));
        } catch (err) {
            console.error("Failed to fetch revenue reports", err);
        } finally {
            setLoading(false);
        }
    };
    fetchRevenue();
  }, [view]);

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Báo Cáo Doanh Thu</h1>
            <p className="text-white/50 text-sm mt-1">{new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</p>
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

        {loading ? (
            <div className="py-20 text-center text-white/20 italic">Đang tải báo cáo doanh thu...</div>
        ) : (
            <>
            {/* Area chart */}
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">
                Doanh thu theo {view === "weekly" ? "tuần" : "tháng"}
            </h3>
            <div className="h-[280px]">
                {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#b11116" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#b11116" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="label" tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtVND} tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff" }}
                            formatter={(v) => [fmtFull(v), "Doanh thu"]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#b11116" strokeWidth={2.5} fill="url(#revenueGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-white/20 italic">Chưa có dữ liệu đồ thị</div>
                )}
            </div>
            </div>

            {/* Comparison bar chart (weekly only) */}
            {view === "weekly" && revenueData.some(d => d.prev > 0) && (
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-4">So sánh tuần hiện tại vs tuần trước</h3>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="label" tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} />
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
            </div>
            )}

            {/* Table */}
            <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
            <div className="px-5 py-3 border-b border-white/10">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Chi tiết theo {view === "weekly" ? "tuần" : "tháng"}</h3>
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
                {tableData.map((r, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-white">{r.period}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#f6c344]">{fmtFull(r.revenue)}</td>
                    <td className="px-5 py-3.5 text-right text-white/70">{r.tickets.toLocaleString("vi-VN")}</td>
                    <td className="px-5 py-3.5 text-right text-white/70">{fmtFull(r.avg)}</td>
                    <td className={`px-5 py-3.5 text-right font-bold ${r.growth.startsWith("+") || !r.growth.startsWith("-") ? "text-emerald-400" : "text-red-400"}`}>{r.growth}</td>
                    </tr>
                ))}
                {tableData.length === 0 && (
                    <tr><td colSpan="5" className="py-20 text-center text-white/20 italic">Chưa có dữ liệu bảng</td></tr>
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

