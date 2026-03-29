import { useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const inputCls = "w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#b11116] focus:ring-1 focus:ring-[#b11116]/40 transition-all duration-200";

export default function TaiKhoanPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("GENERAL");

  const raw = typeof window !== "undefined" ? localStorage.getItem("tnc_user") : null;
  const lsUser = raw ? JSON.parse(raw) : null;
  const displayName = lsUser?.name ?? "Lê Chí";

  const menuItems = [
    { id: "GENERAL",  label: t("general-info") },
    { id: "DETAILS",  label: t("account-details") },
    { id: "PASSWORD", label: t("change-password") },
    { id: "VOUCHER",  label: t("voucher-coupon") },
    { id: "HISTORY",  label: t("transaction-history") },
  ];

  const SectionTitle = ({ label }) => (
    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
      <div className="w-1 h-5 bg-[#b11116] rounded-full" />
      <h3 className="text-sm font-black text-white uppercase tracking-wider">{label}</h3>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 font-bold uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-white/80">{value}</span>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "GENERAL":
        return (
          <div className="space-y-6">
            {/* Profile card */}
            <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b11116] to-[#F5C344] flex items-center justify-center text-2xl font-black text-white shadow-lg">
                  {displayName.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#12121E]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{t("hello")} {displayName}!</h2>
                <p className="text-sm text-white/40 mt-1">{t("manage-account-desc")}</p>
                <span className="inline-block mt-2 bg-blue-900/50 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                  TNC Member
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t("card-level"),           value: "MEMBER",  color: "text-blue-400" },
                { label: "Voucher",                  value: "0",       color: "text-white" },
                { label: "Coupon",                   value: "1",       color: "text-[#F5C344]" },
                { label: t("payment"),               value: "0₫",      color: "text-white" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#12121E] border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Personal info */}
            <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle label={t("personal-info")} />
                <button onClick={() => setActiveTab("DETAILS")}
                  className="text-xs font-bold text-[#b11116] hover:text-[#F5C344] transition-colors cursor-pointer">
                  {t("change")}
                </button>
              </div>
              <InfoRow label={t("full-name")}    value="Lê Chí" />
              <InfoRow label="Email"              value="11a2lekhacchi@gmail.com" />
              <InfoRow label={t("phone-number")} value="0931386546" />
              <InfoRow label={t("address")}       value="Đà Nẵng, Việt Nam" />
            </div>
          </div>
        );

      case "DETAILS":
        return (
          <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6 space-y-5">
            <SectionTitle label={t("account-details")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: t("full-name"),    val: "Lê Chí",                   type: "text" },
                { label: t("phone-number"), val: "0931386546",                type: "tel" },
                { label: "Email",           val: "11a2lekhacchi@gmail.com",   type: "email" },
                { label: t("birthday"),     val: "2000-01-01",                type: "date" },
              ].map(({ label, val, type }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
                  <input type={type} defaultValue={val} className={inputCls} />
                </div>
              ))}
            </div>
            <button className="bg-[#b11116] hover:bg-[#d4151b] text-white font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer">
              {t("save-info")}
            </button>
          </div>
        );

      case "PASSWORD":
        return (
          <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6 space-y-5">
            <SectionTitle label={t("change-password")} />
            <div className="max-w-sm space-y-4">
              {[t("current-password"), t("new-password"), t("confirm-password-label")].map((label) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
                  <input type="password" placeholder="••••••" className={inputCls} />
                </div>
              ))}
            </div>
            <button className="bg-[#b11116] hover:bg-[#d4151b] text-white font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer">
              {t("update")}
            </button>
          </div>
        );

      case "HISTORY":
        return (
          <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6">
            <SectionTitle label={t("transaction-history")} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase tracking-wider">
                    {[t("trans-id"), t("trans-time"), t("cinemas"), t("total"), t("status")].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 font-black">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/20 text-sm italic font-medium">
                      {t("no-transactions")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "VOUCHER":
        return (
          <div className="bg-[#12121E] border border-white/5 rounded-2xl p-6 space-y-4">
            <SectionTitle label={t("my-vouchers")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-[#080812] border border-dashed border-[#b11116]/40 rounded-xl p-4">
                <div className="w-14 h-14 bg-[#b11116] text-white flex items-center justify-center font-black text-[10px] rounded-xl flex-shrink-0">
                  VOUCHER
                </div>
                <div>
                  <p className="font-bold text-[#b11116] text-sm">{t("discount-popcorn") || "20k Popcorn Discount"}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{t("expiry-date")}: 30/12/2026</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TNCLayout>
      <section className="bg-[#080812] min-h-screen py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <h2 className="text-[#b11116] font-black text-lg uppercase mb-5 tracking-tight">{t("tnc-account")}</h2>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap
                      ${isActive
                        ? "bg-[#b11116] text-white shadow-lg shadow-red-950/40"
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-[#b11116]/90 rounded-xl px-5 py-2.5 mb-5 text-center text-xs font-black uppercase tracking-[0.2em] text-white">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </div>
            {renderContent()}
          </main>
        </div>
      </section>
    </TNCLayout>
  );
}
