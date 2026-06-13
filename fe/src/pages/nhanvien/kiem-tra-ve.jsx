import { useState, useRef } from "react";
import AdminLayout from "@/layouts/staff";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import * as htmlToImage from "html-to-image";
import axios from "axios";

const formatTimeSafe = (isoString) => {
  try {
    if (!isoString) return "??:??";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      if (typeof isoString === "string" && isoString.includes(":")) {
        return isoString;
      }
      return "??:??";
    }
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(isoString || "??:??");
  }
};

const formatDateSafe = (isoString) => {
  try {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
};

const formatDateTimeSafe = (isoString) => {
  try {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleString("vi-VN");
  } catch {
    return String(isoString || "—");
  }
};

const STATUS_STYLE = {
  valid:    { label: "Hợp Lệ",  icon: "OK", cls: "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]", text: "text-emerald-400" },
  used:     { label: "Đã Dùng", icon: "!!", cls: "border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]", text: "text-amber-400" },
  invalid:  { label: "Không Hợp Lệ", icon: "X", cls: "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]", text: "text-red-400" },
};

export default function KiemTraVe() {
  const [input, setInput]     = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const ticketRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const token = localStorage.getItem("tnc_token");

  const handleCheck = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/bookings/verify/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(data);

      // Nếu vé hợp lệ → tự động đánh dấu đã dùng
      if (data.status === "valid") {
        await axios.put(`${API}/bookings/verify/${code}/use`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResult(prev => ({ ...prev, status: "used" }));
      }

      setHistory(prev => [{
        code,
        result: data.status === "valid" ? "used" : data.status,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      const status = err.response?.status === 404 ? "invalid" : "invalid";
      setResult({ code, status });
      setHistory(prev => [{
        code, result: "invalid",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handlePrint = async () => {
    if (ticketRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(ticketRef.current, { backgroundColor: '#fcfbf7' });
        const link = document.createElement("a");
        link.download = `Ve-${result?.code || "TNC"}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-white px-2">Khu Vực Soát Vé</h1>

        {/* Input */}
        <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-xl">
          <CardHeader className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">Nhập Mã Vé</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="VD: BK-ABC123XY"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                size="lg"
                disabled={loading}
                classNames={{
                  inputWrapper: "bg-[#0f172a] border border-white/10 focus-within:!border-[#e71a0f] hover:border-white/20 transition-colors shadow-inner",
                  input: "font-mono font-bold text-lg uppercase",
                }}
              />
              <Button
                onClick={handleCheck}
                size="lg"
                isLoading={loading}
                className="bg-[#e71a0f] text-white font-black px-10 shadow-[0_4px_15px_rgba(231,26,15,0.4)] hover:shadow-[0_4px_20px_rgba(231,26,15,0.6)]"
              >
                Kiểm Tra
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-3 font-medium">Nhập mã đặt vé dạng BK-XXXXXXXX (từ hệ thống)</p>
          </CardBody>
        </Card>

        {/* Result */}
        {result && (
          <div className="animate-in zoom-in-95 duration-300">
            {/* TICKET UI FROM VECUATOI */}
            {result.movie ? (
                <>
                <div ref={ticketRef} className="flex flex-col md:flex-row bg-[#fcfbf7] border border-gray-200 shadow-2xl relative overflow-hidden group rounded-sm mb-4">
                    <div className="hidden md:block absolute left-[128px] top-0 bottom-0 w-px border-l-2 border-dashed border-gray-300 z-10"></div>
                    
                    <div className="w-full md:w-32 h-48 md:h-auto bg-[#eee] flex-shrink-0">
                        <img 
                            src={result.posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"} 
                            alt={result.movie} 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    <div className="flex-grow p-6 md:pl-10 space-y-4 flex flex-col justify-center bg-[#fcfbf7]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="text-2xl font-black text-[#b11116] leading-none mb-2">{result.movie}</h4>
                                <Chip className="bg-[#b11116] text-white font-black" radius="none" size="sm">{result.age}</Chip>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MÃ ĐẶT VÉ</p>
                                <p className="text-sm font-black text-[#333]">{result.code}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">RẠP</p>
                                <p className="text-[12px] font-bold text-[#444]">{result.cinema} {result.city ? `• ${result.city}` : ""}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">SUẤT CHIẾU</p>
                                <p className="text-[12px] font-bold text-[#444]">
                                  {formatTimeSafe(result.startTime)}
                                  {" | "}
                                  {formatDateSafe(result.startTime)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">PHÒNG & GHẾ</p>
                                <p className="text-[12px] font-bold text-[#444]">Phòng {result.roomId} | <span className="text-[#b11116]">{result.seats}</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">KHÁCH HÀNG</p>
                                <p className="text-[12px] font-black text-[#333]">{result.customer}</p>
                                {result.customerPhone && <p className="text-[11px] text-gray-400">{result.customerPhone}</p>}
                            </div>
                        </div>
                        {result.combos?.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">COMBO</p>
                            <p className="text-[12px] font-bold text-[#444]">{result.combos.join(", ")}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">TỔNG TIỀN</p>
                          <p className="text-sm font-black text-[#b11116]">{result.totalPrice?.toLocaleString("vi-VN")} đ</p>
                        </div>
                    </div>

                    <div className="w-full md:w-36 bg-gray-100 border-t md:border-t-0 md:border-l border-dashed border-gray-300 flex flex-col items-center justify-center p-4 space-y-2 shrink-0">
                        <div className={`w-20 h-20 p-1 shadow-inner flex items-center justify-center overflow-hidden font-black text-3xl border-4 ${
                            result.status === "valid" ? "text-emerald-500 border-emerald-500" :
                            result.status === "used" ? "text-amber-500 border-amber-500" :
                            "text-red-500 border-red-500"
                        }`}>
                            {STATUS_STYLE[result.status]?.icon}
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[11px] font-black text-gray-600 uppercase tracking-tighter">{STATUS_STYLE[result.status]?.label}</p>
                        </div>
                    </div>

                    <div className="hidden md:block absolute left-[122px] -top-3 w-4 h-4 rounded-full bg-[#1e293b] border border-[#1e293b]"></div>
                    <div className="hidden md:block absolute left-[122px] -bottom-3 w-4 h-4 rounded-full bg-[#1e293b] border border-[#1e293b]"></div>
                </div>
                
                {/* Print Action */}
                <div className="flex justify-end mb-6">
                    <Button 
                        size="md" 
                        onClick={handlePrint} 
                        className="bg-emerald-600 text-white font-black shadow-[0_4px_15px_rgba(52,211,153,0.3)] hover:shadow-emerald-500/50"
                    >
                        IN LẠI VÉ NÀY
                    </Button>
                </div>
                </>
            ) : (
                <Card className={`border backdrop-blur-md mb-4 ${STATUS_STYLE[result.status]?.cls}`}>
                    <CardBody className="p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-black/20 flex items-center justify-center text-5xl shadow-inner border border-white/5 font-black">
                                {STATUS_STYLE[result.status]?.icon}
                            </div>
                            <div>
                                <p className={`font-black text-3xl mb-1 ${STATUS_STYLE[result.status]?.text}`}>{STATUS_STYLE[result.status]?.label}</p>
                                <p className="font-mono text-lg opacity-70">Mã vé: {result.code}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Warning Message if used */}
            {result.status === "used" && (
                <div className="p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <p className="text-amber-400 text-lg font-black tracking-widest uppercase flex items-center gap-3">
                        <span className="bg-amber-500/30 px-3 py-1 rounded">CẢNH BÁO</span> Vé này đã được quét và sử dụng trước đó!
                    </p>
                </div>
            )}
            
            {result.status === "invalid" && !result.movie && (
                 <div className="p-4 bg-red-500/20 border-2 border-red-500/50 rounded-lg mt-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <p className="text-red-400 text-lg font-black tracking-widest uppercase flex items-center gap-3">
                        <span className="bg-red-500/30 px-3 py-1 rounded">CẢNH BÁO</span> Mã vé giả hoặc không tồn tại trong hệ thống!
                    </p>
                </div>
            )}
          </div>
        )}

        {/* History */}
        <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
          <CardHeader className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">Lịch Sử Quét Gần Đây</h3>
          </CardHeader>
          <CardBody className="p-0">
            {history.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm font-bold">Chưa có lịch sử</div>
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                    <span className="text-2xl drop-shadow-md">{STATUS_STYLE[h.result]?.icon}</span>
                    <span className="font-mono font-bold text-white text-base">{h.code}</span>
                    <Chip 
                      size="sm" 
                      radius="sm" 
                      className={`ml-auto font-black shadow-inner border-none ${
                        h.result === "valid"   ? "bg-emerald-500/20 text-emerald-400" :
                        h.result === "used"    ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {STATUS_STYLE[h.result]?.label}
                    </Chip>
                    <span className="text-sm text-white/40 w-16 text-right font-bold">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
