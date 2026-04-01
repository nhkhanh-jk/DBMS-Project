import { useState } from "react";
import AdminLayout from "@/layouts/admin";

const ROLE_BADGE = {
  customer: { label: "Khách hàng", cls: "bg-blue-900/50 text-blue-300" },
  staff:    { label: "Nhân viên",  cls: "bg-purple-900/50 text-purple-300" },
  manager:  { label: "Quản lý",   cls: "bg-emerald-900/50 text-emerald-300" },
  admin:    { label: "Admin",      cls: "bg-red-900/50 text-red-300" },
};

const INITIAL_USERS = [
  { id: 1,  name: "Lê Chí",          email: "lechi@gmail.com",    phone: "0901234567", role: "customer", status: "active",  joined: "10/01/2026" },
  { id: 2,  name: "Administrator",   email: "admin@tnc.vn",       phone: "0909999999", role: "admin",    status: "active",  joined: "01/01/2026" },
  { id: 3,  name: "Trần Nhân Viên",  email: "nv01@tnc.vn",        phone: "0902345678", role: "staff",    status: "active",  joined: "15/01/2026" },
  { id: 4,  name: "Nguyễn Quản Lý",  email: "ql01@tnc.vn",        phone: "0903456789", role: "manager",  status: "active",  joined: "05/01/2026" },
  { id: 5,  name: "Phạm Thị Lan",    email: "lan@gmail.com",      phone: "0904567890", role: "customer", status: "active",  joined: "20/02/2026" },
  { id: 6,  name: "Ngô Minh Khoa",   email: "khoa@gmail.com",     phone: "0905678901", role: "customer", status: "locked",  joined: "18/02/2026" },
  { id: 7,  name: "Lý Thu Hà",       email: "ha@gmail.com",       phone: "0906789012", role: "customer", status: "active",  joined: "22/02/2026" },
  { id: 8,  name: "Trần Văn Bình",   email: "nv02@tnc.vn",        phone: "0907890123", role: "staff",    status: "active",  joined: "01/03/2026" },
];

export default function AdminNguoiDung() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "locked" : "active" } : u
      )
    );
  };

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
          {["all", "customer", "staff", "manager", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filterRole === r
                  ? "bg-[#b11116] text-white"
                  : "bg-[#1e293b] text-white/50 hover:bg-white/10 border border-white/10"
              }`}
            >
              {r === "all" ? "Tất cả" : ROLE_BADGE[r]?.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Tên</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Điện thoại</th>
                <th className="text-left px-5 py-3">Vai trò</th>
                <th className="text-left px-5 py-3">Trạng thái</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Ngày tham gia</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b11116] to-[#f6c344] flex items-center justify-center text-xs font-black flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60 hidden md:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5 text-white/60 hidden lg:table-cell">{u.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[u.role]?.cls}`}>
                      {ROLE_BADGE[u.role]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === "active" ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                      {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 text-xs hidden lg:table-cell">{u.joined}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        u.status === "active"
                          ? "bg-red-900/30 text-red-400 hover:bg-red-900/60"
                          : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60"
                      }`}
                    >
                      {u.status === "active" ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-white/30">Không tìm thấy người dùng</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
