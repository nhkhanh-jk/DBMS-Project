import { useState } from "react";
import AdminLayout from "@/layouts/admin";
import movies from "@/data/movies";

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

  const toggleSeat = (seat) => {
    if (SOLD_SEATS.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handlePrint = () => setPrinted(true);

  const reset = () => {
    setStep(0); setSelectedMovie(null); setSelectedTime(null);
    setSelectedSeats([]); setPrinted(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-white">Bán Vé Tại Quầy</h1>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i <= step ? "bg-[#b11116] text-white" : "bg-white/10 text-white/40"}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="text-white/20 mx-1">›</span>}
            </div>
          ))}
        </div>

        {/* Step 0: Chọn phim & suất */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-black text-white/80 uppercase mb-3">Chọn phim</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nowShowing.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMovie(m)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedMovie?.title === m.title
                        ? "border-[#b11116] bg-[#b11116]/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    }`}
                  >
                    <img src={m.image} alt={m.title} className="w-10 h-14 object-cover rounded" />
                    <div>
                      <p className="text-xs font-black text-white">{m.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{m.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMovie && (
              <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                <h3 className="text-sm font-black text-white/80 uppercase mb-3">Chọn suất chiếu</h3>
                <div className="flex flex-wrap gap-2">
                  {SHOWTIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedTime === t
                          ? "bg-[#b11116] text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!selectedMovie || !selectedTime}
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-xl bg-[#b11116] text-white font-black disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
              Tiếp theo →
            </button>
          </div>
        )}

        {/* Step 1: Chọn ghế */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
              <p className="text-sm text-white/60 mb-1">
                <span className="font-bold text-white">{selectedMovie?.title}</span> · {selectedTime}
              </p>
              <div className="flex gap-4 text-xs text-white/50 mb-4">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white/20 inline-block"></span>Trống</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-[#b11116] inline-block"></span>Đã chọn</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white/10 inline-block opacity-50"></span>Đã bán</span>
              </div>
              <div className="flex justify-center mb-3">
                <div className="h-1.5 w-48 bg-white/20 rounded-full mb-4"></div>
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
                          className={`w-7 h-7 rounded text-[10px] font-bold transition-all flex-shrink-0 ${
                            isSold ? "bg-white/10 text-white/20 cursor-not-allowed" :
                            isSelected ? "bg-[#b11116] text-white" :
                            "bg-white/20 text-white/60 hover:bg-white/40"
                          }`}
                        >
                          {c + 1}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Đã chọn: <span className="font-bold text-white">{selectedSeats.join(", ") || "—"}</span></p>
                <p className="text-sm text-white/60 mt-0.5">Tổng: <span className="font-black text-[#f6c344]">{(selectedSeats.length * TICKET_PRICE).toLocaleString("vi-VN")}₫</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all">← Quay lại</button>
                <button
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#b11116] text-white text-sm font-black disabled:opacity-30 hover:brightness-110 transition-all"
                >
                  Tiếp →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Xác nhận & in vé */}
        {step === 2 && (
          <div className="space-y-4">
            {!printed ? (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-white/5 space-y-4">
                <h3 className="text-lg font-black text-white">Xác nhận thông tin vé</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Phim",         selectedMovie?.title],
                    ["Suất chiếu",   selectedTime],
                    ["Rạp",          "TNC Vincom Đà Nẵng · Phòng 1"],
                    ["Ghế",          selectedSeats.join(", ")],
                    ["Số lượng",     `${selectedSeats.length} vé`],
                    ["Tổng tiền",    `${(selectedSeats.length * TICKET_PRICE).toLocaleString("vi-VN")}₫`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-white/50">{k}</span>
                      <span className="font-bold text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all">← Sửa</button>
                  <button onClick={handlePrint} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-all">🖨️ In vé</button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-emerald-500/30 text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-black text-emerald-400">Vé đã được in thành công!</h3>
                <p className="text-white/50 text-sm">Mã giao dịch: <span className="font-mono font-bold text-white">TNC-{Date.now().toString().slice(-6)}</span></p>
                <button onClick={reset} className="w-full py-3 rounded-xl bg-[#b11116] text-white font-black hover:brightness-110 transition-all">
                  Bán vé mới
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
