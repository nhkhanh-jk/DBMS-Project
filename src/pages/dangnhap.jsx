import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const EyeIcon = ({ open }) => (
  <svg className="w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const DEMO_ACCOUNTS = {
  user:     { name: "Lê Chí",         role: "customer" },
  admin:    { name: "Administrator",  role: "admin" },
  nhanvien: { name: "Trần Nhân Viên", role: "staff" },
  quanly:   { name: "Nguyễn Quản Lý", role: "manager" },
};
const ROLE_REDIRECT = {
  customer: "/thanhvien",
  admin:    "/admin",
  staff:    "/nhanvien",
  manager:  "/quanly",
};

export default function DangNhapPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const account = DEMO_ACCOUNTS[username];
    if (account && password === "123456") {
      setError("");
      localStorage.setItem("tnc_user", JSON.stringify({ name: account.name, username, role: account.role }));
      navigate(ROLE_REDIRECT[account.role]);
    } else {
      setError(t("login-error") || "Tên đăng nhập hoặc mật khẩu không đúng.");
    }
    setLoading(false);
  };

  return (
    <TNCLayout>
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#080812] overflow-hidden">
        {/* Background cinematic glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#b11116]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-[#F5C344]/5 rounded-full blur-[80px]" />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-sm">
          {/* Red accent top bar */}
          <div className="h-1 bg-gradient-to-r from-[#b11116] via-[#F5C344] to-[#b11116] rounded-t-2xl" />

          <div className="bg-[#12121E] border border-white/7 border-t-0 rounded-b-2xl rounded-t-none shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img src="/TNC.png" alt="TNC" className="h-10 w-auto mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-black text-white tracking-tight">{t("login")}</h1>
              <p className="text-sm text-white/40 mt-1">{t("access-tnc-account") || "Truy cập tài khoản TNC của bạn"}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  {t("email-phone")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder={t("enter-email-phone") || "user / admin / nhanvien / quanly"}
                  className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#b11116] focus:ring-1 focus:ring-[#b11116]/40 transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••"
                    className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#b11116] focus:ring-1 focus:ring-[#b11116]/40 transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-white/60 transition-colors"
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link to="#" className="text-xs text-white/30 hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                  {t("forgot-password")}
                </Link>
              </div>

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#b11116] hover:bg-[#d4151b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_0_#7d0b12] hover:shadow-[0_3px_0_#7d0b12] active:shadow-none active:translate-y-[1px] cursor-pointer"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : null}
                {loading ? "Đang xử lý..." : t("login")}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[11px] text-white/20 font-medium">DEMO</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Demo credentials hint */}
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-[11px] text-white/30 space-y-1">
              {[
                { user: "user",     role: "Khách hàng" },
                { user: "admin",    role: "Quản trị" },
                { user: "nhanvien", role: "Nhân viên" },
                { user: "quanly",   role: "Quản lý" },
              ].map((d) => (
                <div key={d.user} className="flex justify-between">
                  <span className="font-mono text-white/50">{d.user}</span>
                  <span>{d.role}</span>
                  <span className="font-mono text-white/30">123456</span>
                </div>
              ))}
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-white/30 mt-6">
              {t("no-account")}{" "}
              <Link to="/dangky" className="text-[#F5C344] font-bold hover:underline cursor-pointer">
                {t("register-now")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
