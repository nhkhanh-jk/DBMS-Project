import { Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";

export default function AdminLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "TỔNG QUAN", path: "/admin" },
    { name: "QL NGƯỜI DÙNG", path: "/admin/nguoidung" },
    { name: "QL RẠP & CHI NHÁNH", path: "/admin/rap" },
    { name: "QL NHÂN VIÊN", path: "/admin/nhanvien" },
    { name: "QL BỘ PHIM", path: "/admin/phim" },
    { name: "🤖 DỰ ĐOÁN AI", path: "/admin/du-doan" },
  ];

  return (
    <div className="flex min-h-screen bg-[#06102b]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a1930] text-white flex flex-col border-r border-[#1e293b] shadow-2xl relative z-20">
        <div className="p-6">
          <h2 className="text-3xl font-black text-[#f6c344] uppercase tracking-widest text-center" style={{ textShadow: "0 0 15px rgba(246,195,68,0.4)" }}>TNC</h2>
          <p className="text-[10px] text-center font-bold text-white/50 tracking-[0.3em] uppercase mt-2">Super Admin</p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-4 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${
                  isActive 
                    ? "bg-[#f6c344]/10 text-[#f6c344] border border-[#f6c344]/30 shadow-[0_0_15px_rgba(246,195,68,0.1)]" 
                    : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#1e293b] mt-auto">
          <div className="flex flex-col gap-1 mb-6 text-center">
             <span className="text-xs uppercase font-bold text-white/30 tracking-widest">Đăng xuất hệ thống?</span>
          </div>
          <Button 
            onClick={() => {
              localStorage.removeItem("tnc_superadmin");
              window.location.href = "/admin/login";
            }}
            className="w-full bg-[#1e293b] text-white hover:bg-[#334155] font-black"
            radius="sm"
          >
            ĐĂNG XUẤT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#06102b]">
        {/* Topbar / Header (optional, simple style) */}
        <header className="h-16 bg-[#0a1930]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">HỆ THỐNG QUẢN TRỊ VIÊN</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">Quản trị viên</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Level: ROOT</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f6c344] to-yellow-600 flex items-center justify-center font-black text-black">A</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto hidden-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
