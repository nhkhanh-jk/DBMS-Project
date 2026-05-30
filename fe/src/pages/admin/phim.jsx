import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { moviesApi } from "@/services/moviesApi";

const STATUS_LABEL = {
  "ACTIVE": { label: "Đang chiếu",  cls: "bg-emerald-900/50 text-emerald-300" },
  "SCHEDULED": { label: "Sắp chiếu",   cls: "bg-amber-900/50 text-amber-300" },
  "SNEAK_SHOW":  { label: "Suất đặc biệt", cls: "bg-purple-900/50 text-purple-300" },
};

const EMPTY_FORM = { title: "", genres: "", durationMin: 120, releaseDate: "", status: "ACTIVE", description: "" };

export default function AdminPhim() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", id: string }
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await moviesApi.getMovies();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách phim.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAdd = () => { 
    setForm(EMPTY_FORM); 
    setModal({ mode: "add" }); 
  };

  const openEdit = (m) => { 
    const formattedDate = m.releaseDate ? new Date(m.releaseDate).toISOString().split("T")[0] : "";
    setForm({ 
      title: m.title || "",
      genres: Array.isArray(m.genres) ? m.genres.join(", ") : (m.genres || ""),
      durationMin: m.durationMin || 120,
      releaseDate: formattedDate,
      status: m.status || "ACTIVE",
      description: m.description || ""
    }); 
    setModal({ mode: "edit", id: m.id || m._id }); 
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      const genresArray = form.genres.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        title: form.title,
        genres: genresArray,
        durationMin: Number(form.durationMin),
        releaseDate: new Date(form.releaseDate),
        status: form.status,
        description: form.description,
      };

      if (modal.mode === "add") {
        await moviesApi.createMovie(payload);
      } else {
        await moviesApi.updateMovie(modal.id, payload);
      }
      closeModal();
      fetchMovies();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu phim: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await moviesApi.deleteMovie(deleteId);
      setDeleteId(null);
      fetchMovies();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa phim: " + (err.response?.data?.error || err.message));
    }
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
            className="bg-[#b11116] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
          >
            + Thêm phim
          </button>
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
          <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Phim</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Thể loại</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Thời lượng</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Khởi chiếu</th>
                  <th className="text-left px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id || m._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎬</span>
                        <span className="font-bold text-white">{m.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 hidden md:table-cell">
                      {Array.isArray(m.genres) ? m.genres.join(", ") : m.genres}
                    </td>
                    <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{m.durationMin} phút</td>
                    <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">
                      {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_LABEL[m.status]?.cls || "bg-gray-800 text-gray-300"}`}>
                        {STATUS_LABEL[m.status]?.label || m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(m)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-900/30 text-blue-400 hover:bg-blue-900/60 transition-all cursor-pointer">Sửa</button>
                        <button onClick={() => setDeleteId(m.id || m._id)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-all cursor-pointer">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-lg font-black text-white mb-5">
              {modal.mode === "add" ? "Thêm phim mới" : "Sửa thông tin phim"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Tên phim</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Thể loại (ngăn cách bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={form.genres}
                  onChange={(e) => setForm((f) => ({ ...f, genres: e.target.value }))}
                  placeholder="Hành Động, Viễn Tưởng"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={form.durationMin}
                  onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Khởi chiếu</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b11116]"
                >
                  <option value="ACTIVE">Đang chiếu</option>
                  <option value="SCHEDULED">Sắp chiếu</option>
                  <option value="SNEAK_SHOW">Suất đặc biệt</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all cursor-pointer">Hủy</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#b11116] text-white text-sm font-bold hover:brightness-110 transition-all cursor-pointer">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm border border-white/10 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-black text-white mb-2">Xác nhận xóa</h2>
            <p className="text-white/60 text-sm mb-6">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa phim này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-all cursor-pointer">Hủy</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all cursor-pointer">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

