import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { apiRequest } from "@/utils/api";

const ROOM_STATUS_STYLE = {
  active:      "bg-emerald-900/50 text-emerald-300",
  maintenance: "bg-amber-900/50 text-amber-300",
  locked:      "bg-red-900/50 text-red-300",
};

export default function AdminRap() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/cinemas");
      const data = Array.isArray(res) ? res : (res?.data || []);
      const mapped = data.map(c => ({
        id: c._id || c.id || c.MaRap,
        name: c.name || c.TenRap,
        city: c.city || c.ThanhPho || "---",
        address: c.address || c.DiaChi || "---",
        status: c.status || (c.TrangThai === 1 ? "active" : "locked"),
        rooms: (c.rooms || c.PhongChieus || []).map(r => ({
            id: r._id || r.id || r.MaPhong,
            name: r.name || r.TenPhong,
            type: r.type || r.LoaiPhong || "Standard",
            seats: r.seatsCount || r.SoGhe || 0,
            status: r.status || (r.TrangThai === 1 ? "active" : "maintenance")
        }))
      }));
      setCinemas(mapped);
      if (mapped.length > 0 && !selectedId) {
        setSelectedId(mapped[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch cinemas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const cinema = cinemas.find((c) => c.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Quản Lý Rạp Chiếu</h1>
          <p className="text-white/50 text-sm mt-0.5">
            {cinemas.length} rạp · {cinemas.reduce((s, c) => s + (c.rooms?.length || 0), 0)} phòng chiếu
          </p>
        </div>

        {loading ? (
            <div className="py-20 text-center text-white/30">Đang tải dữ liệu rạp...</div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cinema list */}
            <div className="space-y-3">
                {cinemas.map((c) => (
                <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedId === c.id
                        ? "bg-[#b11116]/20 border-[#b11116]/50"
                        : "bg-[#1e293b] border-white/5 hover:border-white/20"
                    }`}
                >
                    <p className={`font-bold text-sm ${selectedId === c.id ? "text-white" : "text-white/80"}`}>{c.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{c.city} · {c.rooms?.length || 0} phòng</p>
                </button>
                ))}
                {cinemas.length === 0 && <div className="text-white/30 text-sm italic">Chưa có rạp nào</div>}
            </div>

            {/* Cinema detail */}
            {cinema ? (
                <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                    <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-black text-white">{cinema.name}</h2>
                        <p className="text-sm text-white/50 mt-1">{cinema.address}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${cinema.status === "active" ? "bg-emerald-900/50 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
                        {cinema.status === "active" ? "Hoạt động" : "Khóa"}
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
                        {cinema.rooms?.map((r) => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-white">{r.name}</td>
                            <td className="px-5 py-3.5 text-white/60">{r.type}</td>
                            <td className="px-5 py-3.5 text-white/60">{r.seats} ghế</td>
                            <td className="px-5 py-3.5">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROOM_STATUS_STYLE[r.status] || "bg-gray-800 text-gray-400"}`}>
                                {r.status === "active" ? "Hoạt động" : (r.status === "maintenance" ? "Bảo trì" : "Khóa")}
                            </span>
                            </td>
                        </tr>
                        ))}
                        {(!cinema.rooms || cinema.rooms.length === 0) && (
                            <tr><td colSpan="4" className="py-10 text-center text-white/30 italic">Chưa có phòng chiếu nào</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
            ) : (
                <div className="lg:col-span-2 bg-[#1e293b] rounded-xl p-10 border border-white/5 flex items-center justify-center text-white/30 italic">
                    Chọn một rạp để xem chi tiết
                </div>
            )}
            </div>
        )}
      </div>
    </AdminLayout>
  );
}
