import { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@/layouts/admin";
import { moviesApi } from "@/services/moviesApi";
import { mlApi } from "@/services/mlApi";

const GENRES = [
  "Phim Hành Động", "Phim Tình Cảm", "Phim Hài", "Phim Kinh Dị",
  "Phim Hoạt Hình", "Phim Khoa Học Viễn Tưởng", "Phim Gây Cấn",
  "Phim Tâm Lý", "Phim Gia Đình",
];

function PredictionGauge({ value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 50 ? "#22c55e" : pct >= 25 ? "#f59e0b" : "#ef4444";
  const glow = pct >= 50 ? "rgba(34,197,94,0.4)" : pct >= 25 ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)";
  return (
    <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${glow}`,
        }}
      />
    </div>
  );
}

function FeatureTag({ label, value, highlight }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
      highlight
        ? "bg-[#f6c344]/10 border-[#f6c344]/30 text-[#f6c344]"
        : "bg-white/5 border-white/10 text-white/50"
    }`}>
      <span>{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

export default function DuDoanML() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [form, setForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:00",
    basePrice: 75000,
    genres: [],
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predError, setPredError] = useState("");
  const [mlOnline, setMlOnline] = useState(null);
  const debounceRef = useRef(null);

  // Check ML server health
  useEffect(() => {
    mlApi.health()
      .then(() => setMlOnline(true))
      .catch(() => setMlOnline(false));
  }, []);

  // Load movies
  useEffect(() => {
    moviesApi.getMovies().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setMovies(list.slice(0, 100));
    }).catch(() => {});
  }, []);

  // Auto-fill genres + duration when movie changes
  useEffect(() => {
    if (!selectedMovie) return;
    const genres = Array.isArray(selectedMovie.genres) ? selectedMovie.genres : [];
    setForm(f => ({ ...f, genres: genres.slice(0, 3) }));
  }, [selectedMovie]);

  const doPrediction = useCallback(async () => {
    if (!form.date || !form.time) return;
    setPredicting(true);
    setPredError("");
    try {
      const start_time = `${form.date}T${form.time}:00`;
      const result = await mlApi.predict({
        start_time,
        base_price: form.basePrice,
        duration_min: selectedMovie?.durationMin || 110,
        genres: form.genres,
        avg_rating: selectedMovie?.avgRating || 0,
        review_count: selectedMovie?.reviewCount || 0,
      });
      setPrediction(result);
    } catch (err) {
      setPredError(err.message || "Lỗi kết nối ML server");
    } finally {
      setPredicting(false);
    }
  }, [form, selectedMovie]);

  // Debounce prediction on form change
  useEffect(() => {
    if (mlOnline === false) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doPrediction, 600);
    return () => clearTimeout(debounceRef.current);
  }, [doPrediction, mlOnline]);

  const DOW_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
  const selectedDate = form.date ? new Date(form.date + "T00:00:00") : null;
  const dow = selectedDate ? DOW_NAMES[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1] : "—";
  const isWeekend = selectedDate ? (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) : false;
  const hour = form.time ? parseInt(form.time.split(":")[0]) : 19;
  const isEvening = hour >= 17;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-[#f6c344]/10 border border-[#f6c344]/30 rounded-xl flex items-center justify-center text-xl">🤖</span>
              Dự Đoán Lượng Vé Bán
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-[52px]">AI dự đoán số vé bán theo thông tin suất chiếu — Random Forest Regressor</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${
            mlOnline === true ? "bg-green-900/30 border-green-500/40 text-green-400" :
            mlOnline === false ? "bg-red-900/30 border-red-500/40 text-red-400" :
            "bg-white/5 border-white/10 text-white/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${mlOnline === true ? "bg-green-400 animate-pulse" : mlOnline === false ? "bg-red-400" : "bg-white/20"}`} />
            {mlOnline === true ? "ML Online" : mlOnline === false ? "ML Offline" : "Đang kiểm tra..."}
          </div>
        </div>

        {mlOnline === false && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-sm text-red-300 font-bold">
            ⚠️ ML server chưa chạy. Khởi động bằng lệnh: <code className="bg-black/40 px-2 py-0.5 rounded font-mono text-red-200">cd ml && python api.py</code>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-4">
            {/* Chọn phim */}
            <div className="bg-[#0a1930] border border-[#1e293b] rounded-2xl p-5">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">1. Chọn Phim</h3>
              <select
                value={selectedMovie?.id || ""}
                onChange={(e) => {
                  const m = movies.find(mv => mv.id === e.target.value);
                  setSelectedMovie(m || null);
                }}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#f6c344]/50"
              >
                <option value="">— Chọn phim (tùy chọn) —</option>
                {movies.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              {selectedMovie && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-[#f6c344]/5 border border-[#f6c344]/20 rounded-xl">
                  <img src={selectedMovie.posterUrl || ""} alt="" onError={(e) => e.target.style.display='none'} className="w-10 h-14 object-cover rounded shadow" />
                  <div>
                    <p className="text-sm font-black text-white">{selectedMovie.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{selectedMovie.durationMin || "?"} phút · Rating: {selectedMovie.avgRating?.toFixed(1) || "N/A"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thời gian */}
            <div className="bg-[#0a1930] border border-[#1e293b] rounded-2xl p-5">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">2. Thời Gian Chiếu</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 block">Ngày chiếu</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#f6c344]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 block">Giờ chiếu</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#f6c344]/50"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <FeatureTag label="Ngày" value={dow} highlight={isWeekend} />
                <FeatureTag label="Ca" value={isEvening ? "Tối" : hour <= 11 ? "Sáng" : "Chiều"} highlight={isEvening} />
                {isWeekend && <FeatureTag label="🎉" value="Cuối tuần" highlight />}
              </div>
            </div>

            {/* Giá vé */}
            <div className="bg-[#0a1930] border border-[#1e293b] rounded-2xl p-5">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">3. Giá Vé</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={40000}
                  max={150000}
                  step={5000}
                  value={form.basePrice}
                  onChange={(e) => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))}
                  className="flex-1 accent-[#f6c344]"
                />
                <span className="text-lg font-black text-[#f6c344] w-28 text-right">
                  {form.basePrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-white/20 mt-1 font-bold">
                <span>40K</span><span>70K</span><span>100K</span><span>150K</span>
              </div>
            </div>

            {/* Thể loại */}
            <div className="bg-[#0a1930] border border-[#1e293b] rounded-2xl p-5">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">4. Thể Loại Phim</h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => {
                  const on = form.genres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => setForm(f => ({
                        ...f,
                        genres: on ? f.genres.filter(x => x !== g) : [...f.genres, g]
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                        on
                          ? "bg-[#f6c344]/20 border-[#f6c344]/50 text-[#f6c344]"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Prediction Panel */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-[#0a1930] border border-[#1e293b] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">🤖 Kết Quả Dự Đoán AI</h3>
                {predicting && (
                  <div className="flex items-center gap-2 text-[10px] text-[#f6c344] font-bold">
                    <div className="w-3 h-3 border-2 border-[#f6c344] border-t-transparent rounded-full animate-spin" />
                    Đang tính...
                  </div>
                )}
              </div>

              <div className="p-6">
                {predError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 mb-4">
                    {predError}
                  </div>
                )}

                {!prediction && !predicting && !predError && (
                  <div className="text-center py-12 text-white/20">
                    <div className="text-5xl mb-3">🎬</div>
                    <p className="text-sm font-bold">Nhập thông tin suất chiếu<br/>để nhận dự đoán</p>
                  </div>
                )}

                {prediction && (
                  <div className="space-y-6">
                    {/* Main prediction number */}
                    <div className="text-center py-6 bg-gradient-to-b from-[#f6c344]/5 to-transparent rounded-xl border border-[#f6c344]/10">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Dự đoán số vé bán</p>
                      <div
                        className="text-7xl font-black transition-all duration-700"
                        style={{
                          color: prediction.predicted_tickets >= 40 ? "#22c55e" :
                                 prediction.predicted_tickets >= 20 ? "#f6c344" :
                                 prediction.predicted_tickets >= 10 ? "#f59e0b" : "#ef4444",
                          textShadow: `0 0 30px ${
                            prediction.predicted_tickets >= 40 ? "rgba(34,197,94,0.4)" :
                            prediction.predicted_tickets >= 20 ? "rgba(246,195,68,0.4)" : "rgba(239,68,68,0.4)"
                          }`
                        }}
                      >
                        {prediction.predicted_tickets}
                      </div>
                      <p className="text-white/30 text-sm font-bold mt-1">vé</p>
                      <p className="text-white/20 text-xs mt-2 font-bold">
                        Khoảng tin cậy: {prediction.confidence_range[0]} – {prediction.confidence_range[1]} vé
                      </p>
                    </div>

                    {/* Gauge */}
                    <div>
                      <div className="flex justify-between text-[10px] text-white/30 font-bold mb-2">
                        <span>Vắng</span>
                        <span>Bình thường</span>
                        <span>Đông</span>
                        <span>Rất đông</span>
                      </div>
                      <PredictionGauge value={prediction.predicted_tickets} max={80} />
                      <div className="flex justify-between text-[10px] text-white/20 mt-1">
                        <span>0</span><span>20</span><span>50</span><span>80+</span>
                      </div>
                    </div>

                    {/* Advice */}
                    <div className={`p-4 rounded-xl border text-sm font-bold ${
                      prediction.predicted_tickets >= 40 ? "bg-green-900/20 border-green-500/30 text-green-300" :
                      prediction.predicted_tickets >= 20 ? "bg-yellow-900/20 border-yellow-500/30 text-yellow-300" :
                      prediction.predicted_tickets >= 10 ? "bg-orange-900/20 border-orange-500/30 text-orange-300" :
                      "bg-red-900/20 border-red-500/30 text-red-300"
                    }`}>
                      {prediction.advice}
                    </div>

                    {/* Features used */}
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Features đã dùng</p>
                      <div className="flex flex-wrap gap-2">
                        <FeatureTag label="Ngày" value={["T2","T3","T4","T5","T6","T7","CN"][prediction.features_used.day_of_week]} highlight={prediction.features_used.is_weekend === 1} />
                        <FeatureTag label="Giờ" value={`${prediction.features_used.hour_of_day}h`} highlight={prediction.features_used.is_evening === 1} />
                        <FeatureTag label="Giá" value={`${(prediction.features_used.base_price/1000).toFixed(0)}K`} />
                        <FeatureTag label="TL" value={`${prediction.features_used.duration_min}p`} />
                        {prediction.features_used.is_weekend === 1 && <FeatureTag label="Cuối tuần" value="✓" highlight />}
                        {prediction.features_used.is_evening === 1 && <FeatureTag label="Ca tối" value="✓" highlight />}
                        {prediction.features_used.genres?.map(g => (
                          <FeatureTag key={g} label={g.replace("Phim ", "")} value="✓" highlight />
                        ))}
                      </div>
                    </div>

                    {/* Refresh button */}
                    <button
                      onClick={doPrediction}
                      disabled={predicting}
                      className="w-full py-3 bg-[#f6c344]/10 hover:bg-[#f6c344]/20 border border-[#f6c344]/30 text-[#f6c344] font-black text-sm rounded-xl transition-all disabled:opacity-50"
                    >
                      🔄 Dự đoán lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Model info */}
            <div className="mt-4 p-4 bg-[#0a1930] border border-[#1e293b] rounded-xl">
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Thông tin mô hình</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/40 font-bold">
                  <span>Thuật toán</span><span className="text-white/70">Random Forest Regressor</span>
                </div>
                <div className="flex justify-between text-white/40 font-bold">
                  <span>Số cây (estimators)</span><span className="text-white/70">200</span>
                </div>
                <div className="flex justify-between text-white/40 font-bold">
                  <span>Số features</span><span className="text-white/70">11+ (time + genre + price)</span>
                </div>
                <div className="flex justify-between text-white/40 font-bold">
                  <span>Target</span><span className="text-white/70">Số vé bán / suất chiếu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
