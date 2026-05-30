import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { cinemasApi } from "@/services/cinemasApi";

export default function AdminRap() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchCinemas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cinemasApi.getCinemas();
      const list = Array.isArray(data) ? data : [];
      setCinemas(list);
      if (list.length > 0) {
        setSelectedId(list[0].id || list[0]._id || list[0].MaRap);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách rạp chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const cinema = cinemas.find((c) => (c.id || c._id || c.MaRap) === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Quản Lý Rạp Chiếu</h1>
          <p className="text-white/50 text-sm mt-0.5">
            {cinemas.length} rạp · {cinemas.reduce((s, c) => s + (c.rooms?.length || c.DanhSachPhong?.length || 0), 0)} phòng chiếu
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 text-red-400 font-medium text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#b11116] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cinema list */}
            <div className="space-y-3">
              {cinemas.map((c) => {
                const cId = c.id || c._id || c.MaRap;
                const cName = c.name || c.TenRap;
                const cCity = c.city || c.ThanhPho;
                const roomsCount = c.rooms?.length || c.DanhSachPhong?.length || 0;
                return (
                  <button
                    key={cId}
                    onClick={() => setSelectedId(cId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedId === cId
                        ? "bg-[#b11116]/20 border-[#b11116]/50"
                        : "bg-[#1e293b] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedId === cId ? "text-white" : "text-white/80"}`}>{cName}</p>
                    <p className="text-xs text-white/40 mt-0.5">{cCity} · {roomsCount} phòng</p>
                  </button>
                );
              })}
            </div>

            {/* Cinema detail */}
            {cinema ? (
              <div className="lg:col-span-2 space-y-4 animate-in fade-in duration-300">
                <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-black text-white">{cinema.name || cinema.TenRap}</h2>
                      <p className="text-sm text-white/50 mt-1">{cinema.address || cinema.DiaChi}</p>
                      {cinema.phone && <p className="text-xs text-white/40 mt-1">SĐT: {cinema.phone}</p>}
                    </div>
                    <span className="bg-emerald-900/50 text-emerald-300 text-xs font-bold px-2 py-1 rounded-full">
                      {cinema.isActive !== false ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Danh sách phòng chiếu</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Phòng</th>
                        <th className="text-left px-5 py-3">Loại</th>
                        <th className="text-left px-5 py-3">Số ghế</th>
                        <th className="text-left px-5 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(cinema.rooms || cinema.DanhSachPhong || []).map((r, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-white">Phòng {r.roomNumber || r.SoPhong || idx + 1}</td>
                          <td className="px-5 py-3.5 text-white/60 capitalize">{r.type || r.LoaiPhong || "Standard"}</td>
                          <td className="px-5 py-3.5 text-white/60">{r.capacity || r.SoGhe || 100} ghế</td>
                          <td className="px-5 py-3.5">
                            <span className="bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-full text-xs font-bold">
                              Hoạt động
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(cinema.rooms || cinema.DanhSachPhong || []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-white/45 italic">Rạp này chưa cấu hình phòng chiếu</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 text-center py-20 text-white/40 italic bg-[#1e293b] border border-white/5 rounded-xl">
                Vui lòng chọn rạp chiếu để xem chi tiết
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

