import { useState } from "react";
import AdminLayout from "@/layouts/admin";
import movies from "@/data/movies";

const CAT_LABEL = {
  "now-showing": { label: "Đang chiếu",  cls: "bg-emerald-900/50 text-emerald-300" },
  "coming-soon": { label: "Sắp chiếu",   cls: "bg-amber-900/50 text-amber-300" },
  "sneak-show":  { label: "Suất đặc biệt", cls: "bg-purple-900/50 text-purple-300" },
};

const EMPTY_FORM = { title: "", genre: "", duration: "", releaseDate: "", rating: "P", category: "now-showing" };

export default function AdminPhim() {
  const [list, setList] = useState(
    movies.map((m, i) => ({ ...m, id: i + 1 }))
  );
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", data: {} }
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); };
  const openEdit = (m) => { setForm({ ...m }); setModal({ mode: "edit", id: m.id }); };
  const closeModal = () => setModal(null);

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (modal.mode === "add") {
      setList((prev) => [...prev, { ...form, id: Date.now(), image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=200&q=60" }]);
    } else {
      setList((prev) => prev.map((m) => (m.id === modal.id ? { ...m, ...form } : m)));
    }
    closeModal();
  };

  const handleDelete = () => {
    setList((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Phim</h1>
            <p className="text-white/50 text-sm mt-0.5">{list.length} phim trong hệ thống</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#b11116] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg"
          >
            + Thêm phim
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Phim</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Thể loại</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Thời lượng</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Khởi chiếu</th>
                <th className="text-left px-5 py-3">Trạng thái</th>
                <th className="text-left px-5 py-3">Rating</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={m.image} alt={m.title} className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                      <span className="font-bold text-white">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60 hidden md:table-cell">{m.genre}</td>
                  <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{m.duration}</td>
                  <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{m.releaseDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${CAT_LABEL[m.category]?.cls}`}>
                      {CAT_LABEL[m.category]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs font-bold">{m.rating}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-900/30 text-blue-400 hover:bg-blue-900/60 transition-all">Sửa</button>
                      <button onClick={() => setDeleteId(m.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-all">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-lg font-black text-white mb-5">
              {modal.mode === "add" ? "Thêm phim mới" : "Sửa thông tin phim"}
            </h2>
            <div className="space-y-3">
              {[
                { key: "title",       label: "Tên phim",    type: "text"  },
                { key: "genre",       label: "Thể loại",    type: "text"  },
                { key: "duration",    label: "Thời lượng",  type: "text"  },
                { key: "releaseDate", label: "Khởi chiếu",  type: "text"  },
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 font-semibold block mb-1">Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                  >
                    {["P","T13","T16","T18","K"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 font-semibold block mb-1">Trạng thái</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                  >
                    <option value="now-showing">Đang chiếu</option>
                    <option value="coming-soon">Sắp chiếu</option>
                    <option value="sneak-show">Suất đặc biệt</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all">Hủy</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#b11116] text-white text-sm font-bold hover:brightness-110 transition-all">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <h2 className="text-lg font-black text-white mb-2">Xác nhận xóa</h2>
            <p className="text-white/60 text-sm mb-6">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa phim này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all">Hủy</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
