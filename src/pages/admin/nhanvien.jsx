import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { apiRequest } from "@/utils/api";

const POSITIONS = ["Nhân viên bán vé", "Nhân viên phục vụ", "Kiểm soát vé", "Quản lý ca", "Kỹ thuật viên"];
const SHIFTS = ["Sáng", "Chiều", "Tối"];

const EMPTY_FORM = { name: "", email: "", phone: "", position: POSITIONS[0], cinemaId: "", shift: SHIFTS[0] };

export default function AdminNhanVien() {
  const [staff, setStaff] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [staffRes, cinemaRes] = await Promise.all([
        apiRequest("/admin/staffs"),
        apiRequest("/admin/cinemas").catch(() => [])
      ]);

      const staffData = Array.isArray(staffRes) ? staffRes : (staffRes?.data || []);
      const cinemaData = Array.isArray(cinemaRes) ? cinemaRes : (cinemaRes?.data || []);
      
      setCinemas(cinemaData.map(c => ({ 
        id: c._id || c.id || c.MaRap, 
        name: c.name || c.TenRap 
      })));

      setStaff(staffData.map(s => ({
        id: s._id || s.id || s.MaNhanVien,
        name: s.fullName || s.HoTen || s.name || "Unknown",
        email: s.email || s.Email || "",
        phone: s.phone || s.Sdt || "",
        position: (s.position || s.ChucVu || "Nhân viên").toUpperCase(),
        cinema: s.cinemaName || s.TenRap || (cinemaData.find(c => (c._id || c.id || c.MaRap) === s.MaRap)?.TenRap) || "---",
        shift: s.shift || s.CaLam || "Sáng",
        status: s.status || (s.TrangThai === 1 ? "active" : "inactive")
      })));
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAdd = () => { 
    setForm({ ...EMPTY_FORM, cinemaId: cinemas[0]?.id || "" }); 
    setModal({ mode: "add" }); 
  };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
        await apiRequest("/admin/staffs", {
            method: "POST",
            body: JSON.stringify({
                HoTen: form.name,
                Email: form.email,
                Sdt: form.phone,
                ChucVu: form.position,
                MaRap: form.cinemaId,
                CaLam: form.shift
            })
        });
        fetchStaff();
        closeModal();
    } catch (err) {
        alert("Lỗi khi thêm nhân viên: " + err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        await apiRequest(`/admin/staffs/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus })
        });
        setStaff(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
        alert("Lỗi khi cập nhật trạng thái: " + err.message);
    }
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
          {loading ? (
             <div className="py-20 text-center text-white/30">Đang tải danh sách nhân viên...</div>
          ) : (
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
                        onClick={() => toggleStatus(s.id, s.status)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all"
                        >
                        {s.status === "active" ? "Cho nghỉ" : "Kích hoạt"}
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          )}
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
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Chức vụ</label>
                <select
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                >
                    {POSITIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Rạp làm việc</label>
                <select
                    value={form.cinemaId}
                    onChange={(e) => setForm((f) => ({ ...f, cinemaId: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                >
                    {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Ca làm</label>
                <select
                    value={form.shift}
                    onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                >
                    {SHIFTS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
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
