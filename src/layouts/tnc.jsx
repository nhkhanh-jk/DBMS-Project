import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { apiRequest, clearAuth } from "@/utils/api";

export default function TNCLayout({ children }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("tnc_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-[#f4efe3] text-[#222]">
      {/* Absolute Logo Top Left */}
      <Link to="/" className="absolute left-2 top-2 z-50 lg:left-8">
        <img src="/TNC.png" alt="TNC Logo" className="h-[70px] md:h-[110px] w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform origin-top-left" />
      </Link>

      {/* Topbar */}
      <div className="border-b border-[#d7cdbb] bg-[#efe6d5] py-2 md:py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pl-[90px] md:pl-[150px]">
          <div className="flex items-center gap-4 text-[13px] font-bold text-[#555]">
            <Link to="/uudai" className="hover:text-[#b11116] transition-colors">{t("promotions")}</Link>
            <span className="hidden md:inline text-gray-300">|</span>
            <Link to="/thanhvien" className="hover:text-[#b11116] transition-colors">{t("membership")}</Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {!user ? (
              <>
                <Link to="/dangnhap">
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="bg-white border-2 border-[#b11116] text-[#b11116] font-black uppercase text-[12px] h-9 px-4 hover:bg-[#b11116] hover:text-white transition-all shadow-sm"
                    radius="full"
                  >
                    {t("login")}
                  </Button>
                </Link>
                <Link to="/dangky">
                  <Button 
                    size="sm" 
                    className="bg-[#b11116] text-white font-black uppercase text-[12px] h-9 px-4 hover:brightness-110 shadow-sm"
                    radius="full"
                  >
                    {t("register")}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/50 rounded-full border border-gray-300 shadow-inner">
                   <span className="text-[12px] font-bold text-gray-500 uppercase">{t("welcome")}</span>
                   <Link to="/taikhoan" className="text-[13px] font-black text-[#b11116] hover:underline">{user.name}!</Link>
                </div>
                <Button 
                  onClick={handleLogout}
                  size="sm" 
                  className="bg-gray-800 text-white font-black uppercase text-[11px] h-9 px-4 hover:bg-black transition-all shadow-md"
                  radius="full"
                >
                  {t("logout")}
                </Button>
              </div>
            )}
            <div className="h-8 w-[1px] bg-gray-300 hidden md:block"></div>
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === "vi-VN" ? "en-US" : "vi-VN")}
              className="text-[12px] font-black text-white bg-[#b11116] px-3 py-1 rounded-full cursor-pointer shadow-sm hover:scale-105 transition-transform uppercase"
            >
                {i18n.language === "vi-VN" ? "VN" : "EN"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-30 border-b-4 border-[#7d0b12] bg-[#b11116] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 pl-[90px] md:pl-[150px]">
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-6 text-[15px] font-semibold uppercase tracking-wide">
              <Link to="/phim" className="hover:text-[#ffd54d] transition-colors">{t("movies")}</Link>
              <Link to="/rap" className="hover:text-[#ffd54d] transition-colors">{t("cinemas")}</Link>
              <Link to="/thanhvien" className="hover:text-[#ffd54d] transition-colors">{t("membership")}</Link>
              <Link to="/uudai" className="hover:text-[#ffd54d] transition-colors">{t("promotions")}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/vecuatoi">
                <Button
                className="bg-[#f6c344] font-black text-[#651014] shadow-[0_4px_0_#9a1c22] hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-none transition-all h-10 px-6 uppercase tracking-widest text-[13px]"
                radius="full"
                size="md"
                >
                {t("my-tickets")}
                </Button>
            </Link>
            <Link to="/taikhoan">
                <Button
                className="bg-white font-black text-[#b11116] border-2 border-[#f6c344] shadow-[0_4px_0_#9a1c22] hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-none transition-all h-10 px-6 uppercase tracking-widest text-[13px]"
                radius="full"
                size="md"
                >
                {t("account")}
                </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2a0f10] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="inline-block">
              <img src="/TNC.png" alt="TNC Logo" className="h-[40px] w-auto object-contain" />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/75">
              {t("footer-desc")}
            </p>
          </div>
          <div>
            <h4 className="text-lg font-black">{t("tnc-vietnam")}</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><Link to="/gioithieu" className="hover:text-white transition-colors">{t("about")}</Link></li>
              <li><Link to="/tuyendung" className="hover:text-white transition-colors">{t("recruitment")}</Link></li>
              <li><Link to="/lienhe" className="hover:text-white transition-colors">{t("contact")}</Link></li>
              <li><Link to="/baomat" className="hover:text-white transition-colors">{t("privacy-policy")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-black">{t("support")}</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="hover:text-white cursor-pointer transition-colors">Hotline: 1900 6017</li>
              <li className="hover:text-white cursor-pointer transition-colors">Email: support@demo.local</li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t("faq")}</Link></li>
              <li><Link to="/quydinh" className="hover:text-white transition-colors">{t("terms-of-use")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-sm text-white/60">
          © 2026 UI demo inspired by TNC Vietnam. Built by Antigravity using HeroUI.
        </div>
      </footer>
    </div>
  );
}
