import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ─── Inline SVG icons ───────────────────────────────────── */
const TicketIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const MenuIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

/* ─── Nav link (active highlight) ───────────────────────── */
function NavLink({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-[14px] font-semibold transition-colors duration-200 rounded-md cursor-pointer
        ${isActive
          ? "text-[#F5C344]"
          : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F5C344] rounded-full" />
      )}
    </Link>
  );
}

/* ─── Main layout ────────────────────────────────────────── */
export default function TNCLayout({ children }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("tnc_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tnc_user");
    setUser(null);
    navigate("/");
    setMobileOpen(false);
  };

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "vi-VN" ? "en-US" : "vi-VN");

  const adminPath =
    user?.role === "staff" ? "/nhanvien" :
    user?.role === "manager" ? "/quanly" : "/admin";

  const NAV_LINKS = [
    { to: "/phim",     label: t("movies") },
    { to: "/rap",      label: t("cinemas") },
    { to: "/thanhvien",label: t("membership") },
    { to: "/uudai",    label: t("promotions") },
  ];

  return (
    <div className="min-h-screen bg-[#080812] text-white">

      {/* ── STICKY HEADER ─────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_30px_rgba(0,0,0,0.8)]" : ""}`}>

        {/* Thin topbar */}
        <div className="bg-[#05050F] border-b border-white/5">
          <div className="mx-auto max-w-7xl flex items-center justify-between h-9 px-4">
            <div className="flex items-center gap-5 text-[11px] text-white/40 font-semibold tracking-wide">
              <Link to="/uudai" className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                {t("promotions")}
              </Link>
              <span className="text-white/10">•</span>
              <Link to="/thanhvien" className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                {t("membership")}
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-white/40 hover:text-white font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer"
              >
                <GlobeIcon />
                {i18n.language === "vi-VN" ? "VN" : "EN"}
              </button>

              {!user ? (
                <div className="flex items-center gap-3">
                  <Link to="/dangnhap" className="text-white/50 hover:text-white font-semibold transition-colors duration-150 cursor-pointer">
                    {t("login")}
                  </Link>
                  <span className="text-white/10">|</span>
                  <Link to="/dangky" className="text-[#F5C344] hover:text-[#ffd97d] font-bold transition-colors duration-150 cursor-pointer">
                    {t("register")}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {["admin", "staff", "manager"].includes(user.role) && (
                    <Link
                      to={adminPath}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-150 cursor-pointer"
                    >
                      <SettingsIcon />
                      Quản trị
                    </Link>
                  )}
                  <span className="text-white/30">|</span>
                  <span className="text-white/40">
                    {t("welcome")}{" "}
                    <Link to="/taikhoan" className="text-[#F5C344] font-bold hover:underline cursor-pointer">
                      {user.name}
                    </Link>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-white/30 hover:text-red-400 transition-colors duration-150 font-medium cursor-pointer"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="bg-[#0C0C1A]/95 backdrop-blur-md border-b border-white/5">
          <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 cursor-pointer">
              <img
                src="/TNC.png"
                alt="TNC Cinema"
                className="h-10 w-auto object-contain hover:opacity-90 transition-opacity duration-150"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} label={l.label} />
              ))}
            </nav>

            {/* CTA buttons + hamburger */}
            <div className="flex items-center gap-2">
              <Link to="/vecuatoi" className="hidden sm:flex cursor-pointer">
                <button className="flex items-center gap-2 bg-[#F5C344] hover:bg-[#ffd97d] text-[#5c1f00] font-black text-[13px] uppercase tracking-wider px-5 h-9 rounded-full transition-all duration-200 shadow-[0_3px_0_#c49a00] hover:shadow-[0_2px_0_#c49a00] active:shadow-none active:translate-y-[1px] cursor-pointer">
                  <TicketIcon />
                  {t("my-tickets")}
                </button>
              </Link>
              <Link to="/taikhoan" className="hidden sm:flex cursor-pointer">
                <button className="flex items-center gap-2 bg-[#b11116] hover:bg-[#d4151b] text-white font-black text-[13px] uppercase tracking-wider px-5 h-9 rounded-full transition-all duration-200 shadow-[0_3px_0_#7d0b12] hover:shadow-[0_2px_0_#7d0b12] active:shadow-none active:translate-y-[1px] cursor-pointer">
                  <UserIcon />
                  {t("account")}
                </button>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150 cursor-pointer"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0C0C1A] border-l border-white/5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
              <img src="/TNC.png" alt="TNC" className="h-8 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150 cursor-pointer"
                >
                  {l.label}
                </Link>
              ))}

              <div className="border-t border-white/5 my-3" />

              <Link
                to="/vecuatoi"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#F5C344] hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                <TicketIcon />
                {t("my-tickets")}
              </Link>
              <Link
                to="/taikhoan"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                <UserIcon />
                {t("account")}
              </Link>

              {!user ? (
                <>
                  <div className="border-t border-white/5 my-3" />
                  <Link to="/dangnhap" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-center bg-[#b11116] text-white rounded-xl hover:bg-[#d4151b] transition-all cursor-pointer">
                    {t("login")}
                  </Link>
                  <Link to="/dangky" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-center border border-[#F5C344]/40 text-[#F5C344] rounded-xl hover:bg-[#F5C344]/10 transition-all cursor-pointer">
                    {t("register")}
                  </Link>
                </>
              ) : (
                <>
                  <div className="border-t border-white/5 my-3" />
                  {["admin", "staff", "manager"].includes(user.role) && (
                    <Link to={adminPath} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-sky-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <SettingsIcon />
                      Trang quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-900/20 rounded-xl transition-all cursor-pointer"
                  >
                    {t("logout")}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main>{children}</main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-[#05050F] border-t border-white/5 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src="/TNC.png" alt="TNC Cinema" className="h-10 w-auto mb-4 opacity-90" />
            <p className="text-sm text-white/40 leading-7">{t("footer-desc")}</p>
            <div className="flex gap-3 mt-5">
              {/* Social icons placeholder */}
              {["fb", "ig", "yt"].map((s) => (
                <div key={s} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 cursor-pointer hover:bg-white/10 hover:text-white/60 transition-all duration-150">
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* TNC Vietnam */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">{t("tnc-vietnam")}</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {[
                { to: "/gioithieu", label: t("about") },
                { to: "/tuyendung",  label: t("recruitment") },
                { to: "/lienhe",     label: t("contact") },
                { to: "/baomat",     label: t("privacy-policy") },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">{t("support")}</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li className="hover:text-white/70 transition-colors cursor-pointer">Hotline: 1900 6017</li>
              <li className="hover:text-white/70 transition-colors cursor-pointer">Email: support@tnc.demo</li>
              <li><Link to="/faq" className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">{t("faq")}</Link></li>
              <li><Link to="/quydinh" className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">{t("terms-of-use")}</Link></li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">{t("movies")}</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {[
                { to: "/phim",      label: t("now-showing") },
                { to: "/phim",      label: t("coming-soon") },
                { to: "/phim",      label: t("sneak-show") },
                { to: "/rap",       label: t("cinemas") },
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 py-5 px-4">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/20">
            <p>© 2026 TNC Cinema. UI demo — Not a real service.</p>
            <div className="flex gap-4">
              <Link to="/quydinh" className="hover:text-white/50 transition-colors cursor-pointer">{t("terms-of-use")}</Link>
              <Link to="/baomat" className="hover:text-white/50 transition-colors cursor-pointer">{t("privacy-policy")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
