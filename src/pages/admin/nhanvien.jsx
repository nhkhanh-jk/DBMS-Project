import { useState } from "react";
import AdminLayout from "@/layouts/admin";

const INITIAL_STAFF = [
  { id: 1, name: "Trần Nhân Viên", email: "nv01@tnc.vn",   phone: "0902345678", position: "Nhân viên bán vé", cinema: "TNC Vincom Đà Nẵng", shift: "Sáng",  status: "active" },
  { id: 2, name: "Trần Văn Bình",  email: "nv02@tnc.vn",   phone: "0907890123", position: "Nhân viên bán vé", cinema: "TNC Vincom Hà Nội",   shift: "Chiều", status: "active" },
  { id: 3, name: "Lê Thị Cúc",     email: "nv03@tnc.vn",   phone: "0908901234", position: "Nhân viên phục vụ", cinema: "TNC Landmark TP.HCM", shift: "Tối",   status: "active" },
  { id: 4, name: "Phạm Quốc Dũng", email: "nv04@tnc.vn",   phone: "0909012345", position: "Kiểm soát vé",     cinema: "TNC Vincom Đà Nẵng", shift: "Sáng",  status: "active" },
  { id: 5, name: "Hoàng Thị Em",   email: "nv05@tnc.vn",   phone: "0901234568", position: "Quản lý ca",       cinema: "TNC Vincom Hà Nội",   shift: "Chiều", status: "inactive" },
];

const EMPTY_FORM = { name: "", email: "", phone: "", position: "Nhân viên bán vé", cinema: "TNC Vincom Đà Nẵng", shift: "Sáng" };

const CINEMAS = ["TNC Vincom Đà Nẵng", "TNC Vincom Hà Nội", "TNC Landmark TP.HCM"];
const SHIFTS = ["Sáng", "Chiều", "Tối"];
const POSITIONS = ["Nhân viên bán vé", "Nhân viên phục vụ", "Kiểm soát vé", "Quản lý ca", "Kỹ thuật viên"];

export default function AdminNhanVien() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); };
  const closeModal = () => setModal(null);

  const handleSave = () => {
    if (!form.name.trim()) return;
    setStaff((prev) => [...prev, { ...form, id: Date.now(), status: "active" }]);
    closeModal();
  };

  const toggleStatus = (id) => {
    setStaff((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Nhân Viên</h1>
            <p className="text-white/50 text-sm mt-0.5">{staff.length} nhân viên</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#b11116] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg"
          >
            + Thêm nhân viên
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Tên</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Chức vụ</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Rạp</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Ca</th>
                <th className="text-left px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{s.name}</p>
                        <p className="text-xs text-white/40">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60 hidden md:table-cell">{s.position}</td>
                  <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell text-xs">{s.cinema}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs font-bold">{s.shift}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === "active" ? "bg-emerald-900/50 text-emerald-400" : "bg-gray-900/50 text-gray-400"}`}>
                      {s.status === "active" ? "Đang làm" : "Nghỉ"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(s.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all"
                    >
                      {s.status === "active" ? "Cho nghỉ" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-lg font-black text-white mb-5">Thêm nhân viên mới</h2>
            <div className="space-y-3">
              {[
                { key: "name",  label: "Họ và tên",   type: "text" },
                { key: "email", label: "Email",        type: "email" },
                { key: "phone", label: "Điện thoại",   type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs text-white/50 font-semibold block mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                  />
                </div>
              ))}
              {[
                { key: "position", label: "Chức vụ", opts: POSITIONS },
                { key: "cinema",   label: "Rạp",     opts: CINEMAS },
                { key: "shift",    label: "Ca làm",  opts: SHIFTS },
              ].map(({ key, label, opts }) => (
                <div key={key}>
                  <label className="text-xs text-white/50 font-semibold block mb-1">{label}</label>
                  <select
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                  >
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all">Hủy</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#b11116] text-white text-sm font-bold hover:brightness-110 transition-all">Thêm</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
