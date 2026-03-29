import { useState } from "react";
import AdminLayout from "@/layouts/admin";

const VALID_TICKETS = {
  "TNC-001234": { movie: "QUỶ NHẬP TRÀNG 2", seat: "C5", time: "19:00", room: "Phòng 1", cinema: "TNC Vincom Đà Nẵng", status: "valid",   customer: "Lê Chí" },
  "TNC-002345": { movie: "CÚ NHẢY KỲ DIỆU",  seat: "A3", time: "14:00", room: "Phòng 2", cinema: "TNC Vincom Đà Nẵng", status: "valid",   customer: "Phạm Thị Lan" },
  "TNC-003456": { movie: "ĐÊM NGÀY XA MẸ",   seat: "E7", time: "16:45", room: "Phòng 1", cinema: "TNC Vincom Đà Nẵng", status: "used",    customer: "Ngô Minh Khoa" },
  "TNC-004567": { movie: "SIÊU TRỘM QUYẾT CHIẾN", seat: "B2", time: "21:30", room: "Phòng 3", cinema: "TNC Vincom Đà Nẵng", status: "valid", customer: "Lý Thu Hà" },
};

const STATUS_STYLE = {
  valid:    { label: "Hợp lệ",  icon: "✅", cls: "bg-emerald-900/30 border-emerald-500/40 text-emerald-300" },
  used:     { label: "Đã dùng", icon: "⚠️", cls: "bg-amber-900/30 border-amber-500/40 text-amber-300" },
  invalid:  { label: "Không hợp lệ", icon: "❌", cls: "bg-red-900/30 border-red-500/40 text-red-300" },
};

const RECENT_SCANS = [
  { code: "TNC-001234", result: "valid",   time: "13:45" },
  { code: "TNC-003456", result: "used",    time: "13:32" },
  { code: "TNC-009999", result: "invalid", time: "13:21" },
];

export default function KiemTraVe() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(RECENT_SCANS);

  const handleCheck = () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    const ticket = VALID_TICKETS[code];
    const res = ticket
      ? { code, ...ticket }
      : { code, status: "invalid" };
    setResult(res);
    setHistory((prev) => [{ code, result: res.status, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }, ...prev.slice(0, 9)]);
    if (ticket?.status === "valid") {
      VALID_TICKETS[code] = { ...ticket, status: "used" };
    }
    setInput("");
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white">Kiểm Tra Vé</h1>

        {/* Input */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-3">Nhập mã vé</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="VD: TNC-001234"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#b11116] uppercase"
            />
            <button
              onClick={handleCheck}
              className="px-6 py-3 bg-[#b11116] text-white font-black rounded-xl hover:brightness-110 transition-all text-sm"
            >
              Kiểm tra
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">Gõ mã vé và nhấn Enter hoặc bấm Kiểm tra. Demo: TNC-001234, TNC-002345, TNC-003456</p>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-5 border ${STATUS_STYLE[result.status]?.cls}`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{STATUS_STYLE[result.status]?.icon}</span>
              <div className="flex-1">
                <p className="font-black text-lg">{STATUS_STYLE[result.status]?.label}</p>
                <p className="font-mono text-sm opacity-70">{result.code}</p>
                {result.movie && (
                  <div className="mt-3 space-y-1 text-sm">
                    {[
                      ["Phim",      result.movie],
                      ["Ghế",       result.seat],
                      ["Suất",      result.time],
                      ["Phòng",     result.room],
                      ["Khách",     result.customer],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="opacity-60 w-16">{k}:</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                    {result.status === "used" && (
                      <p className="text-amber-300 text-xs font-bold mt-2">⚠️ Vé này đã được sử dụng trước đó.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-black text-white/80 uppercase tracking-wider mb-3">Lịch sử quét gần đây</h3>
          {history.length === 0 ? (
            <p className="text-white/30 text-sm">Chưa có lịch sử</p>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-base">{STATUS_STYLE[h.result]?.icon}</span>
                  <span className="font-mono text-sm text-white">{h.code}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${
                    h.result === "valid"   ? "bg-emerald-900/50 text-emerald-400" :
                    h.result === "used"    ? "bg-amber-900/50 text-amber-400" :
                    "bg-red-900/50 text-red-400"
                  }`}>
                    {STATUS_STYLE[h.result]?.label}
                  </span>
                  <span className="text-xs text-white/30 w-10 text-right">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
