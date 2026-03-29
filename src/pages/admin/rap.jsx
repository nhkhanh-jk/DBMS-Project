import { useState } from "react";
import AdminLayout from "@/layouts/admin";

const CINEMAS = [
  {
    id: 1, name: "TNC Vincom Đà Nẵng", city: "Đà Nẵng",
    address: "Vincom Plaza, 910A Ngô Quyền, Đà Nẵng",
    status: "active", rooms: [
      { id: 1, name: "Phòng 1", seats: 120, type: "Standard", status: "active" },
      { id: 2, name: "Phòng 2", seats: 80,  type: "VIP",      status: "active" },
      { id: 3, name: "Phòng 3", seats: 60,  type: "IMAX",     status: "maintenance" },
    ],
  },
  {
    id: 2, name: "TNC Vincom Hà Nội", city: "Hà Nội",
    address: "Vincom Center Bà Triệu, Hà Nội",
    status: "active", rooms: [
      { id: 4, name: "Phòng 1", seats: 150, type: "Standard", status: "active" },
      { id: 5, name: "Phòng 2", seats: 90,  type: "VIP",      status: "active" },
    ],
  },
  {
    id: 3, name: "TNC Landmark TP.HCM", city: "Hồ Chí Minh",
    address: "Landmark 81, Vinhomes, Bình Thạnh, TP.HCM",
    status: "active", rooms: [
      { id: 6, name: "Phòng 1", seats: 200, type: "Standard", status: "active" },
      { id: 7, name: "Phòng 2", seats: 100, type: "VIP",      status: "active" },
      { id: 8, name: "Phòng 3", seats: 80,  type: "IMAX",     status: "active" },
      { id: 9, name: "Phòng 4", seats: 50,  type: "Premium",  status: "active" },
    ],
  },
];

const ROOM_STATUS_STYLE = {
  active:      "bg-emerald-900/50 text-emerald-300",
  maintenance: "bg-amber-900/50 text-amber-300",
};

export default function AdminRap() {
  const [selected, setSelected] = useState(CINEMAS[0].id);
  const cinema = CINEMAS.find((c) => c.id === selected);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">Quản Lý Rạp Chiếu</h1>
          <p className="text-white/50 text-sm mt-0.5">{CINEMAS.length} rạp · {CINEMAS.reduce((s, c) => s + c.rooms.length, 0)} phòng chiếu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cinema list */}
          <div className="space-y-3">
            {CINEMAS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected === c.id
                    ? "bg-[#b11116]/20 border-[#b11116]/50"
                    : "bg-[#1e293b] border-white/5 hover:border-white/20"
                }`}
              >
                <p className={`font-bold text-sm ${selected === c.id ? "text-white" : "text-white/80"}`}>{c.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{c.city} · {c.rooms.length} phòng</p>
              </button>
            ))}
          </div>

          {/* Cinema detail */}
          {cinema && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#1e293b] rounded-xl p-5 border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">{cinema.name}</h2>
                    <p className="text-sm text-white/50 mt-1">{cinema.address}</p>
                  </div>
                  <span className="bg-emerald-900/50 text-emerald-300 text-xs font-bold px-2 py-1 rounded-full">Hoạt động</span>
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
                    {cinema.rooms.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white">{r.name}</td>
                        <td className="px-5 py-3.5 text-white/60">{r.type}</td>
                        <td className="px-5 py-3.5 text-white/60">{r.seats} ghế</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROOM_STATUS_STYLE[r.status]}`}>
                            {r.status === "active" ? "Hoạt động" : "Bảo trì"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
