import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ROLE_LABEL = {
  admin:   { text: "Quản Trị Viên", color: "bg-red-500" },
  staff:   { text: "Nhân Viên",     color: "bg-blue-500" },
  manager: { text: "Quản Lý",       color: "bg-emerald-500" },
};

const SIDEBAR_MENUS = {
  admin: [
    { path: "/admin",           icon: "⊞", label: "Dashboard" },
    { path: "/admin/nguoidung", icon: "👥", label: "Người dùng" },
    { path: "/admin/phim",      icon: "🎬", label: "Phim" },
    { path: "/admin/rap",       icon: "🏛️", label: "Rạp chiếu" },
    { path: "/admin/nhanvien",  icon: "🪪", label: "Nhân viên" },
  ],
  staff: [
    { path: "/nhanvien",              icon: "⊞", label: "Dashboard" },
    { path: "/nhanvien/ban-ve",       icon: "🎟️", label: "Bán vé" },
    { path: "/nhanvien/kiem-tra-ve",  icon: "✅", label: "Kiểm tra vé" },
    { path: "/nhanvien/lich-chieu",   icon: "📅", label: "Lịch chiếu" },
  ],
  manager: [
    { path: "/quanly",                icon: "⊞", label: "Dashboard" },
    { path: "/quanly/doanh-thu",      icon: "💰", label: "Doanh thu" },
    { path: "/quanly/bao-cao-phim",   icon: "🎞️", label: "Báo cáo phim" },
    { path: "/quanly/bao-cao-rap",    icon: "📊", label: "Báo cáo rạp" },
  ],
};

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const raw = localStorage.getItem("tnc_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tnc_user");
    navigate("/dangnhap");
  };

  const role = user?.role ?? "admin";
  const menuItems = SIDEBAR_MENUS[role] ?? SIDEBAR_MENUS.admin;
  const roleMeta = ROLE_LABEL[role] ?? ROLE_LABEL.admin;

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-[#1e293b] flex flex-col transition-all duration-300 shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/TNC.png" alt="TNC" className="h-8 w-auto" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Backoffice</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/60 hover:text-white p-1 rounded transition-colors ml-auto"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && user && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b11116] to-[#f6c344] flex items-center justify-center text-sm font-black">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${roleMeta.color}`}>
                  {roleMeta.text}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold
                  ${isActive
                    ? "bg-[#b11116] text-white shadow-lg shadow-red-900/30"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold"
            title={!sidebarOpen ? "TNC Cinema" : undefined}
          >
            <span className="text-base flex-shrink-0">🎭</span>
            {sidebarOpen && <span>TNC Cinema</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-red-900/40 hover:text-red-400 transition-all text-sm font-semibold"
            title={!sidebarOpen ? "Đăng xuất" : undefined}
          >
            <span className="text-base flex-shrink-0">⏻</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#1e293b] border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white/80">
              {menuItems.find((m) => m.path === location.pathname)?.label ?? "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span>TNC Backoffice</span>
            <span className="text-white/20">|</span>
            <span>{new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
