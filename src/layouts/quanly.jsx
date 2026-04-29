import { Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { clearAuth } from "@/utils/api";

export default function ManagerLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "Tổng Quan Rạp", path: "/quanly" },
    { name: "Doanh Thu", path: "/quanly/doanh-thu" },
    { name: "Báo Cáo Phim", path: "/quanly/bao-cao-phim" },
    { name: "Báo Cáo Rạp", path: "/quanly/bao-cao-rap" },
    { name: "Suất Chiếu", path: "/quanly/suat-chieu" },
    { name: "Nhân Sự", path: "/quanly/nhan-vien" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617]"> {/* Slate 950 */}
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col border-r border-[#1e293b] shadow-2xl relative z-20">
        <div className="p-6">
          <h2 className="text-3xl font-black text-[#ea580c] uppercase tracking-widest text-center" style={{ textShadow: "0 0 15px rgba(234,88,12,0.4)" }}>TNC</h2>
          <p className="text-[9px] text-center font-bold text-white/50 tracking-[0.2em] uppercase mt-2">Đà Nẵng Branch</p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === "/quanly/" && item.path === "/quanly");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-4 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${
                  isActive 
                    ? "bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/30 shadow-[0_0_15px_rgba(234,88,12,0.1)]" 
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
              clearAuth();
              window.location.href = "/quanly/login";
            }}
            className="w-full bg-[#1e293b] text-white hover:bg-[#334155] font-black"
            radius="sm"
          >
            ĐĂNG XUẤT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#020617]">
        {/* Topbar */}
        <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Quản Lý Chi Nhánh TNC</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">Quản lý rạp</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Level: MANAGER</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ea580c] to-orange-500 flex items-center justify-center font-black text-white">M</div>
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
