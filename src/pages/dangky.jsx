import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const provinces = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Ninh", "Bến Tre",
  "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau",
  "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai",
  "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh",
  "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa",
  "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn",
];
const days   = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const years  = Array.from({ length: 80 }, (_, i) => 2007 - i);

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#b11116] focus:ring-1 focus:ring-[#b11116]/40 transition-all duration-200";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

export default function DangKyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
    day: "", month: "", year: "", gender: "male", province: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
    if (!form.email.trim()) e.email = "Vui lòng nhập email";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      const userData = {
        name: form.fullName,
        username: form.email,
        role: "customer",
      };
      localStorage.setItem("tnc_user", JSON.stringify(userData));
      navigate("/thanhvien");
    }
  };

  return (
    <TNCLayout>
      <section className="relative min-h-screen flex items-start justify-center px-4 py-14 bg-[#080812] overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#b11116]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-xl">
          <div className="h-1 bg-gradient-to-r from-[#b11116] via-[#F5C344] to-[#b11116] rounded-t-2xl" />

          <div className="bg-[#12121E] border border-white/7 border-t-0 rounded-b-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img src="/TNC.png" alt="TNC" className="h-10 w-auto mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-black text-white">{t("registration")}</h1>
              <p className="text-sm text-white/40 mt-1">{t("create-account-desc") || "Tạo tài khoản TNC Cinema của bạn"}</p>
            </div>

            <div className="space-y-4">
              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("full-name")}>
                  <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Nguyễn Văn A" className={inputCls} />
                  {errors.fullName && <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>}
                </Field>
                <Field label={t("phone-number")}>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    placeholder="09xxxxxxxx" className={inputCls} />
                  {errors.phone && <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>}
                </Field>
              </div>

              {/* Email */}
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="email@example.com" className={inputCls} />
                {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
              </Field>

              {/* Birthday */}
              <Field label={t("birthday")}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "day",   placeholder: t("day")   || "Ngày",   opts: days },
                    { key: "month", placeholder: t("month") || "Tháng",  opts: months },
                    { key: "year",  placeholder: t("year")  || "Năm",    opts: years },
                  ].map(({ key, placeholder, opts }) => (
                    <select key={key} value={form[key]} onChange={(e) => set(key, e.target.value)} className={selectCls}>
                      <option value="">{placeholder}</option>
                      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ))}
                </div>
              </Field>

              {/* Gender */}
              <Field label={t("gender")}>
                <div className="flex gap-4">
                  {[{ val: "male", label: t("male") }, { val: "female", label: t("female") }].map(({ val, label }) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => set("gender", val)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
                          ${form.gender === val ? "border-[#b11116] bg-[#b11116]" : "border-white/20 group-hover:border-white/40"}`}
                      >
                        {form.gender === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-white/70">{label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              {/* Province */}
              <Field label={`${t("address")} (Tỉnh/Thành phố)`}>
                <select value={form.province} onChange={(e) => set("province", e.target.value)} className={selectCls}>
                  <option value="">Chọn tỉnh / thành phố</option>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("password")}>
                  <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••" className={inputCls} />
                  {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password}</p>}
                </Field>
                <Field label={t("confirm-password-label")}>
                  <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="••••••" className={inputCls} />
                  {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1">{errors.confirmPassword}</p>}
                </Field>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full bg-[#F5C344] hover:bg-[#ffd97d] text-[#5c1f00] font-black text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_0_#c49a00] hover:shadow-[0_3px_0_#c49a00] active:shadow-none active:translate-y-[1px] cursor-pointer"
              >
                {t("register-submit")}
              </button>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-white/30 mt-6">
              {t("already-have-account")}{" "}
              <Link to="/dangnhap" className="text-[#b11116] font-bold hover:underline cursor-pointer">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
