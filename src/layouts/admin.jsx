import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/* ─── SVG Icon system ───────────────────────────────────── */
function Icon({ children, size = 18, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const Icons = {
  grid: (
    <Icon>
      <rect width="7" height="7" x="3" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/>
      <rect width="7" height="7" x="3" y="14" rx="1"/>
    </Icon>
  ),
  users: (
    <Icon>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </Icon>
  ),
  film: (
    <Icon>
      <rect width="20" height="20" x="2" y="2" rx="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </Icon>
  ),
  building: (
    <Icon>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </Icon>
  ),
  badge: (
    <Icon>
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </Icon>
  ),
  ticket: (
    <Icon>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2M13 17v2M13 11v2"/>
    </Icon>
  ),
  checkCircle: (
    <Icon>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </Icon>
  ),
  calendar: (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </Icon>
  ),
  trendingUp: (
    <Icon>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </Icon>
  ),
  barChart: (
    <Icon>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </Icon>
  ),
  pieChart: (
    <Icon>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </Icon>
  ),
  theater: (
    <Icon>
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
      <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/>
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
      <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
      <path d="M2 16h.01M21.8 16c.2-2 .131-5.354 0-6"/>
      <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/>
    </Icon>
  ),
  logOut: (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </Icon>
  ),
  chevronLeft: (
    <Icon size={16}><path d="m15 18-6-6 6-6"/></Icon>
  ),
  chevronRight: (
    <Icon size={16}><path d="m9 18 6-6-6-6"/></Icon>
  ),
  menu: (
    <Icon>
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
    </Icon>
  ),
};

/* ─── Role config ───────────────────────────────────────── */
const ROLE_META = {
  admin:   { label: "Quản Trị Viên", color: "bg-red-500",     dot: "bg-red-400" },
  staff:   { label: "Nhân Viên",     color: "bg-blue-500",    dot: "bg-blue-400" },
  manager: { label: "Quản Lý",       color: "bg-emerald-500", dot: "bg-emerald-400" },
};

const SIDEBAR_MENUS = {
  admin: [
    { path: "/admin",           icon: Icons.grid,        label: "Dashboard" },
    { path: "/admin/nguoidung", icon: Icons.users,       label: "Người dùng" },
    { path: "/admin/phim",      icon: Icons.film,        label: "Phim" },
    { path: "/admin/rap",       icon: Icons.building,    label: "Rạp chiếu" },
    { path: "/admin/nhanvien",  icon: Icons.badge,       label: "Nhân viên" },
  ],
  staff: [
    { path: "/nhanvien",             icon: Icons.grid,       label: "Dashboard" },
    { path: "/nhanvien/ban-ve",      icon: Icons.ticket,     label: "Bán vé" },
    { path: "/nhanvien/kiem-tra-ve", icon: Icons.checkCircle,label: "Kiểm tra vé" },
    { path: "/nhanvien/lich-chieu",  icon: Icons.calendar,   label: "Lịch chiếu" },
  ],
  manager: [
    { path: "/quanly",              icon: Icons.grid,      label: "Dashboard" },
    { path: "/quanly/doanh-thu",    icon: Icons.trendingUp,label: "Doanh thu" },
    { path: "/quanly/bao-cao-phim", icon: Icons.barChart,  label: "Báo cáo phim" },
    { path: "/quanly/bao-cao-rap",  icon: Icons.pieChart,  label: "Báo cáo rạp" },
  ],
};

/* ─── Layout ────────────────────────────────────────────── */
export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
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
  const roleMeta = ROLE_META[role] ?? ROLE_META.admin;

  const currentLabel = menuItems.find((m) => m.path === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="backoffice flex min-h-screen bg-[#020617] text-white">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 bg-[#0F172A] flex flex-col transition-all duration-300 border-r border-white/5
          ${collapsed ? "w-[60px]" : "w-60"}`}
      >
        {/* Sidebar header */}
        <div className={`flex items-center border-b border-white/5 h-14 ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 cursor-pointer" title="Về TNC Cinema">
              <img src="/TNC.png" alt="TNC" className="h-7 w-auto opacity-90" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Backoffice</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer"
          >
            {collapsed ? Icons.chevronRight : Icons.chevronLeft}
          </button>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b11116] to-[#F5C344] flex items-center justify-center text-xs font-black">
                  {user.name.charAt(0)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0F172A] ${roleMeta.dot}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white truncate leading-tight">{user.name}</p>
                <span className={`inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded-full text-white font-bold tracking-wide ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer
                  ${collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-[#b11116] text-white shadow-lg shadow-red-950/50"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                {!collapsed && (
                  <span className="text-[13px] font-semibold truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 space-y-0.5 border-t border-white/5">
          <Link
            to="/"
            title={collapsed ? "TNC Cinema" : undefined}
            className={`flex items-center gap-3 rounded-lg text-white/40 hover:bg-white/5 hover:text-white/70 transition-all duration-150 cursor-pointer
              ${collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"}`}
          >
            {Icons.theater}
            {!collapsed && <span className="text-[13px] font-semibold">TNC Cinema</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={collapsed ? "Đăng xuất" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-white/40 hover:bg-red-950/40 hover:text-red-400 transition-all duration-150 cursor-pointer
              ${collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"}`}
          >
            {Icons.logOut}
            {!collapsed && <span className="text-[13px] font-semibold">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#0F172A] border-b border-white/5 h-14 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white/70 tracking-wide">{currentLabel}</h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/30">
            <span className="font-mono">TNC Backoffice</span>
            <span className="text-white/10">·</span>
            <span>{new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
