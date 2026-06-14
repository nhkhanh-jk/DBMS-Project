import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin";
import { usersApi } from "@/services/cinemasApi"; // usersApi is in cinemasApi.js

const ROLE_BADGE = {
  "KHACHHANG": { label: "Khách hàng", cls: "bg-blue-900/50 text-blue-300" },
  "NHANVIEN":  { label: "Nhân viên",  cls: "bg-purple-900/50 text-purple-300" },
  "ADMIN":     { label: "Admin",      cls: "bg-red-900/50 text-red-300" },
};

export default function AdminNguoiDung() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterRole !== "all") {
        params.role = filterRole;
      }
      const data = await usersApi.getUsers(params);
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const toggleStatus = async (user) => {
    const userId = user.id || user._id || user.MaND || user.userId;
    const currentStatus = user.isActive !== false;
    try {
      await usersApi.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái người dùng: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = users.filter((u) => {
    const name = u.fullName || u.HoTen || "";
    const email = u.email || u.Email || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Người Dùng</h1>
            <p className="text-white/50 text-sm mt-0.5">{users.length} tài khoản trong hệ thống</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#b11116] w-64"
          />
          {["all", "KHACHHANG", "NHANVIEN", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                filterRole === r
                  ? "bg-[#b11116] text-white"
                  : "bg-[#1e293b] text-white/50 hover:bg-white/10 border border-white/10"
              }`}
            >
              {r === "all" ? "Tất cả" : ROLE_BADGE[r]?.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 text-red-400 font-medium text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#b11116] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Tên</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Điện thoại</th>
                  <th className="text-left px-5 py-3">Vai trò</th>
                  <th className="text-left px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const uId = u.id || u._id || u.MaND || u.userId;
                  const uName = u.fullName || u.HoTen || u.username || "-";
                  const uEmail = u.email || u.Email || "-";
                  const uPhone = u.phoneNumber || u.SoDienThoai || "-";
                  const uRole = u.role || u.VaiTro || "KHACHHANG";
                  const isActive = u.isActive !== false;

                  return (
                    <tr key={uId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b11116] to-[#f6c344] flex items-center justify-center text-xs font-black flex-shrink-0 text-white">
                            {uName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{uName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-white/60 hidden md:table-cell">{uEmail}</td>
                      <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{uPhone}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[uRole]?.cls || "bg-gray-800 text-gray-300"}`}>
                          {ROLE_BADGE[uRole]?.label || uRole}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                          {isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? "bg-red-900/30 text-red-400 hover:bg-red-900/60"
                              : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60"
                          }`}
                        >
                          {isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-white/30">Không tìm thấy người dùng</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

