import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { apiRequest } from "@/utils/api";

const CAT_LABEL = {
  "DANG_CHIEU": { label: "Đang chiếu",  cls: "bg-emerald-900/50 text-emerald-300" },
  "SAP_CHIEU":  { label: "Sắp chiếu",   cls: "bg-amber-900/50 text-amber-300" },
  "SUAT_DAC_BIET": { label: "Suất đặc biệt", cls: "bg-purple-900/50 text-purple-300" },
};

const EMPTY_FORM = { title: "", genre: "", duration: "", releaseDate: "", rating: "P", category: "DANG_CHIEU", image: "" };

export default function AdminPhim() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); 
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/admin/movies");
      // Dữ liệu nằm trong res.items dựa trên log của bạn
      const data = res?.items || (Array.isArray(res) ? res : (res?.data || []));
      
      setList(data.map(m => ({
        ...m,
        id: m.id || m._id || m.MaPhim,
        title: m.title || m.TenPhim,
        genre: m.genre || m.TheLoai,
        duration: m.duration || m.ThoiLuong,
        releaseDate: m.releaseDate || m.NgayKhoiChieu,
        rating: m.rating || m.DinhDang || "P",
        category: m.status || m.TrangThai || "DANG_CHIEU",
        image: m.image || m.HinhAnh || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=200&q=60"
      })));
    } catch (err) {
      console.error("Failed to fetch movies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); };
  const openEdit = (m) => { setForm({ ...m }); setModal({ mode: "edit", id: m.id }); };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.title?.trim()) return;
    try {
      const method = modal.mode === "add" ? "POST" : "PUT";
      const url = modal.mode === "add" ? "/admin/movies" : `/admin/movies/${modal.id}`;
      
      await apiRequest(url, {
        method,
        body: JSON.stringify({
            TenPhim: form.title,
            TheLoai: form.genre,
            ThoiLuong: parseInt(form.duration),
            NgayKhoiChieu: form.releaseDate,
            DinhDang: form.rating,
            TrangThai: form.category,
            HinhAnh: form.image
        })
      });
      
      fetchMovies();
      closeModal();
    } catch (err) {
      alert("Lỗi khi lưu phim: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/admin/movies/${deleteId}`, { method: "DELETE" });
      setList((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Lỗi khi xóa phim: " + err.message);
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
            className="bg-[#b11116] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg"
          >
            + Thêm phim
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-x-auto">
          {loading ? (
             <div className="py-20 text-center text-white/30">Đang tải danh sách phim...</div>
          ) : (
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
                    <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{m.duration} phút</td>
                    <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">
                        {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString("vi-VN") : "---"}
                    </td>
                    <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${CAT_LABEL[m.category]?.cls || "bg-gray-800 text-gray-400"}`}>
                        {CAT_LABEL[m.category]?.label || m.category}
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
          )}
        </div>
      </div>

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
                { key: "duration",    label: "Thời lượng (phút)",  type: "number"  },
                { key: "releaseDate", label: "Khởi chiếu (YYYY-MM-DD)",  type: "text"  },
                { key: "image",       label: "URL Hình ảnh",  type: "text"  },
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
                    <option value="DANG_CHIEU">Đang chiếu</option>
                    <option value="SAP_CHIEU">Sắp chiếu</option>
                    <option value="SUAT_DAC_BIET">Suất đặc biệt</option>
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
