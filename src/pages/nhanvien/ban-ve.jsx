import { useState, useRef } from "react";
import AdminLayout from "@/layouts/staff";
import movies from "@/data/movies";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import * as htmlToImage from "html-to-image";

const SHOWTIMES = ["10:00", "12:30", "14:00", "16:45", "19:00", "21:30"];

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;
const SOLD_SEATS = ["A3", "A4", "B5", "C7", "D2", "D3", "E8"];

const TICKET_PRICE = 90000;

const STEPS = ["Chọn phim & suất", "Chọn ghế", "Xác nhận & in vé"];

export default function BanVe() {
  const [step, setStep] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [printed, setPrinted] = useState(false);

  const nowShowing = movies.filter((m) => m.category === "now-showing");
  const receiptRef = useRef(null);

  const toggleSeat = (seat) => {
    if (SOLD_SEATS.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handlePrint = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(receiptRef.current, { backgroundColor: '#1e293b' });
        const link = document.createElement("a");
        link.download = `Hoadon-TNC-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Oops, something went wrong!", err);
      }
    }
    setPrinted(true);
  };

  const reset = () => {
    setStep(0); setSelectedMovie(null); setSelectedTime(null);
    setSelectedSeats([]); setPrinted(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-white">Bán Vé Tại Quầy</h1>

        {/* Steps */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg ${i <= step ? "bg-[#e71a0f] text-white" : "bg-white/10 text-white/40"}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-bold hidden sm:block tracking-wide uppercase ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="text-white/20 mx-2 text-xl">›</span>}
            </div>
          ))}
        </div>

        {/* Step 0: Chọn phim & suất */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
              <CardHeader className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-black text-white/80 uppercase">Chọn phim</h3>
              </CardHeader>
              <CardBody className="px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nowShowing.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedMovie(m)}
                      className={`flex items-center gap-4 p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                        selectedMovie?.title === m.title
                          ? "border-[#e71a0f] bg-[#e71a0f]/20 shadow-[0_0_15px_rgba(231,26,15,0.2)]"
                          : "border-white/5 hover:border-white/30 bg-white/5"
                      }`}
                    >
                      {selectedMovie?.title === m.title && <div className="absolute inset-0 bg-gradient-to-r from-[#e71a0f]/20 to-transparent pointer-events-none"></div>}
                      <img src={m.image} alt={m.title} className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
                      <div className="relative z-10 w-full">
                        <p className="text-sm font-black text-white truncate">{m.title}</p>
                        <p className="text-[10px] text-white/50 mt-1 uppercase font-bold tracking-widest">{m.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {selectedMovie && (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-top-4 duration-300">
                <CardHeader className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white/80 uppercase">Chọn suất chiếu</h3>
                </CardHeader>
                <CardBody className="px-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    {SHOWTIMES.map((t) => (
                      <Button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        size="md"
                        className={`font-black ${
                          selectedTime === t
                            ? "bg-[#e71a0f] text-white shadow-[0_4px_10px_rgba(231,26,15,0.4)]"
                            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <Button
              size="lg"
              fullWidth
              disabled={!selectedMovie || !selectedTime}
              onClick={() => setStep(1)}
              className="bg-[#e71a0f] text-white font-black disabled:opacity-30 shadow-[0_4px_10px_rgba(231,26,15,0.3)] hover:shadow-[0_4px_15px_rgba(231,26,15,0.5)]"
            >
              Tiếp theo →
            </Button>
          </div>
        )}

        {/* Step 1: Chọn ghế */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 shadow-lg">
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <p className="text-xl font-black text-white tracking-widest uppercase">{selectedMovie?.title}</p>
                  <p className="text-sm font-bold text-[#e71a0f] mt-1">{selectedTime}</p>
                </div>
                
                <div className="flex justify-center gap-6 text-xs text-white/50 mb-8 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded border-2 border-green-500"></span>Trống</span>
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-[#e71a0f] border-2 border-[#e71a0f] shadow-[0_0_10px_rgba(231,26,15,0.4)]"></span>Đang chọn</span>
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-white/20 border-2 border-white/20 opacity-50"></span>Đã bán</span>
                </div>
                
                <div className="flex justify-center mb-10">
                  <div className="w-3/4 flex flex-col items-center gap-2">
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.1)]"></div>
                    <div className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20">MÀN HÌNH</div>
                  </div>
                </div>

                <div className="space-y-1.5 overflow-x-auto">
                  {ROWS.map((row) => (
                    <div key={row} className="flex items-center gap-1.5 justify-center">
                      <span className="text-xs text-white/30 w-4 text-right">{row}</span>
                      {Array.from({ length: COLS }, (_, c) => {
                        const seat = `${row}${c + 1}`;
                        const isSold = SOLD_SEATS.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <button
                            key={seat}
                            onClick={() => toggleSeat(seat)}
                            disabled={isSold}
                            className={`w-8 h-8 rounded text-xs font-black transition-all flex-shrink-0 flex items-center justify-center border-2 hover:scale-110 ${
                              isSold ? "bg-white/10 border-transparent text-white/30 cursor-not-allowed" :
                              isSelected ? "bg-[#e71a0f] border-[#e71a0f] text-white shadow-[0_0_10px_rgba(231,26,15,0.5)]" :
                              "bg-transparent border-green-500 text-green-500 hover:bg-green-500/20"
                            }`}
                          >
                            {isSold ? "X" : c + 1}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-[#e71a0f]/50 shadow-[0_0_20px_rgba(231,26,15,0.1)]">
              <CardBody className="p-5 flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Ghế đang chọn: <span className="font-bold text-white text-lg ml-2">{selectedSeats.join(", ") || "—"}</span></p>
                  <p className="text-sm text-white/60">Tổng thanh toán: <span className="font-black text-[#f6c344] text-xl ml-2">{(selectedSeats.length * TICKET_PRICE).toLocaleString("vi-VN")} đ</span></p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" onClick={() => setStep(0)} variant="flat" className="bg-white/10 text-white font-bold px-8">← Thông Tin</Button>
                  <Button
                    size="lg"
                    disabled={selectedSeats.length === 0}
                    onClick={() => setStep(2)}
                    className="bg-[#e71a0f] text-white font-black px-10 shadow-[0_4px_10px_rgba(231,26,15,0.4)] disabled:opacity-50"
                  >
                    Thanh Toán
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 2: Xác nhận & in vé */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {!printed ? (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 max-w-xl mx-auto">
                <CardBody className="p-8">
                  <div ref={receiptRef} className="p-6 bg-[#1e293b] rounded-2xl">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#e71a0f]/20 text-[#e71a0f] rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(231,26,15,0.3)]">
                        <span className="text-2xl font-black">TNC</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">XÁC NHẬN HÓA ĐƠN</h3>
                    </div>
                  
                  <div className="space-y-3 text-sm p-4 bg-black/30 rounded-xl border border-white/5">
                    {[
                      ["Phim",         selectedMovie?.title],
                      ["Suất chiếu",   selectedTime],
                      ["Phòng chiếu",  "TNC Vincom Đà Nẵng · Phòng 1"],
                      ["Vị trí ghế",   selectedSeats.join(", ")],
                      ["Số lượng vé",  `${selectedSeats.length} vé`],
                      ["TỔNG THU",    `${(selectedSeats.length * TICKET_PRICE).toLocaleString("vi-VN")} đ`],
                    ].map(([k, v], i) => (
                      <div key={k} className={`flex justify-between py-2 ${i === 5 ? "border-t border-white/20 mt-2 pt-4" : "border-b border-white/5"}`}>
                        <span className={`text-white/60 ${i===5?"uppercase font-bold tracking-widest":""}`}>{k}</span>
                        <span className={`font-black ${i===5?"text-2xl text-[#f6c344]":"text-white"}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button size="lg" onClick={() => setStep(1)} variant="flat" className="flex-1 bg-white/10 text-white font-bold">← CHỈNH SỬA</Button>
                    <Button size="lg" onClick={handlePrint} className="flex-1 bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]">IN VÉ NGAY</Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="bg-[#1e293b]/80 backdrop-blur-md border border-emerald-500/30 max-w-xl mx-auto shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                <CardBody className="p-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                    <span className="text-5xl font-black">OK</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">ĐÃ XUẤT VÉ!</h3>
                  <p className="text-white/60 mb-8">Vui lòng giao vé cho khách hàng. Chúc khách hàng xem phim vui vẻ.</p>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 w-full mb-8">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Mã Giao Dịch</p>
                    <p className="font-mono text-xl font-bold text-[#f6c344]">TNC-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <Button size="lg" onClick={reset} fullWidth className="bg-[#e71a0f] text-white font-black">
                    + GIAO DỊCH MỚI
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
