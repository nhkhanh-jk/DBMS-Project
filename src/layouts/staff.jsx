import { Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";

export default function AdminLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "Tổng Quan", path: "/nhanvien" },
    { name: "Bán Vé POS", path: "/nhanvien/ban-ve" },
    { name: "Soát Vé Trực Tuyến", path: "/nhanvien/kiem-tra-ve" },
    { name: "Lịch Chiếu", path: "/nhanvien/lich-chieu" },
  ];

  return (
    <div className="flex bg-[#0f172a] min-h-[100vh] font-sans text-white relative">
      <div className="w-64 bg-[#1e293b] flex flex-col border-r border-[#334155] shadow-2xl shrink-0 fixed top-0 bottom-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-[#334155]">
          <Link to="/" className="text-xl font-black text-white hover:opacity-80 transition-all flex items-center gap-2">
            <span className="text-[#e71a0f]">TNC</span> CINEMAS
          </Link>
          <span className="ml-2 px-2 py-0.5 bg-white/10 text-white/50 text-[10px] font-bold rounded-sm uppercase tracking-widest">
            Staff
          </span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-2">Nghiệp Vụ Quầy</div>
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-black transition-all uppercase tracking-widest ${
                    isActive 
                      ? "bg-[#e71a0f]/20 text-[#ff4b4b] border border-[#e71a0f]/30 shadow-[0_0_15px_rgba(231,26,15,0.1)]" 
                      : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#334155] mt-auto">
          <Link to="/">
              <Button 
                className="w-full bg-[#334155] text-white hover:bg-[#475569] font-bold"
                radius="sm"
              >
                VỀ TRANG KHÁCH
              </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <header className="h-16 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-8 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white/40 text-sm hidden md:block">Chi nhánh trực:</span>
            <span className="px-3 py-1 bg-[#334155] text-white rounded-md text-sm font-bold border border-[#475569] shadow-inner">
                TNC Vincom Đà Nẵng
            </span>
          </div>
          <div className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
            <div className="hidden md:block text-right">
              <div className="text-sm font-black text-white">Ngô Minh Khoa</div>
              <div className="text-[10px] uppercase tracking-widest text-[#e71a0f] font-bold">Nhân Viên Bán Vé</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e71a0f] to-orange-500 border-2 border-white/20 shadow-md"></div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] -z-10"></div>
          {children}
        </main>
      </div>
    </div>
  );
}
