import { useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";

export default function TaiKhoanPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("GENERAL");

  const menuItems = [
    { id: "GENERAL", label: t("general-info") },
    { id: "DETAILS", label: t("account-details") },
    { id: "PASSWORD", label: t("change-password") },
    { id: "VOUCHER", label: t("voucher-coupon") },
    { id: "HISTORY", label: t("transaction-history") },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "GENERAL":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-200 pb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                   <span className="text-4xl text-gray-400">👤</span>
                </div>
                <Button size="sm" variant="flat" className="bg-gray-400 text-white font-bold h-7 px-4" radius="none">
                  {t("change")}
                </Button>
              </div>
              <div className="flex-grow pt-2">
                <p className="text-lg font-bold text-[#333]">{t("hello")} Lê Chí,</p>
                <p className="text-sm text-[#666] mt-1 italic">
                  {t("manage-account-desc")}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                    <p className="text-[11px] text-[#666] font-bold uppercase mb-2">{t("card-level")}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-xl font-bold">★ {t("tnc-member")}</span>
                    </div>
                </div>
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white group">
                    <p className="text-[11px] text-[#666] font-bold uppercase mb-2">Voucher</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-black">0</span>
                        <Button size="sm" className="bg-[#337ab7] text-white font-bold h-7" radius="none" onClick={() => setActiveTab("VOUCHER")}>{t("details")}</Button>
                    </div>
                </div>
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
                    <p className="text-[11px] text-[#666] font-bold uppercase mb-2">Coupon</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-black">1</span>
                        <Button size="sm" className="bg-[#337ab7] text-white font-bold h-7" radius="none">{t("details")}</Button>
                    </div>
                </div>
                <div className="p-4 bg-white">
                    <p className="text-[11px] text-[#666] font-bold uppercase mb-2">{t("payment")}</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-black">0 đ</span>
                        <Button size="sm" className="bg-[#337ab7] text-white font-bold h-7" radius="none" onClick={() => setActiveTab("HISTORY")}>{t("transaction-history")}</Button>
                    </div>
                </div>
            </div>

            {/* Detailed Info */}
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
                    <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">{t("personal-info")}</h4>
                    <Button size="sm" variant="flat" className="bg-gray-400 text-white font-bold h-7" radius="none" onClick={() => setActiveTab("DETAILS")}>{t("change")}</Button>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-[120px_1fr] border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-[11px]">{t("full-name")} :</span>
                        <span className="font-bold text-[#333]">Lê Chí</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-[11px]">Email :</span>
                        <span className="text-[#333]">11a2lekhacchi@gmail.com</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-[11px]">{t("phone-number")} :</span>
                        <span className="text-[#333]">0931386546</span>
                    </div>
                     <div className="grid grid-cols-[120px_1fr]">
                        <span className="text-gray-500 font-bold uppercase text-[11px]">{t("address")} :</span>
                        <span className="text-[#333]">Đà Nẵng, Việt Nam</span>
                    </div>
                </div>
            </div>
          </div>
        );
      case "DETAILS":
        return (
          <div className="bg-white p-8 border border-gray-300 rounded-sm shadow-sm space-y-6">
             <h3 className="text-xl font-black border-b-2 border-black pb-2 uppercase italic text-[#b11116]">{t("account-details")}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Input label={t("full-name")} defaultValue="Lê Chí" variant="bordered" radius="none" />
                <Input label={t("phone-number")} defaultValue="0931386546" variant="bordered" radius="none" />
                <Input label="Email" defaultValue="11a2lekhacchi@gmail.com" variant="bordered" radius="none" disabled />
                <Input label={t("birthday")} type="date" defaultValue="2000-01-01" variant="bordered" radius="none" />
             </div>
             <Button className="bg-[#b11116] text-white font-bold w-full md:w-40" radius="none">{t("save-info")}</Button>
          </div>
        );
      case "PASSWORD":
        return (
          <div className="bg-white p-8 border border-gray-300 rounded-sm shadow-sm space-y-6">
             <h3 className="text-xl font-black border-b-2 border-black pb-2 uppercase italic text-[#b11116]">{t("change-password")}</h3>
             <div className="max-w-md space-y-4 pt-4">
                <Input label={t("current-password")} type="password" variant="bordered" radius="none" isRequired />
                <Input label={t("new-password")} type="password" variant="bordered" radius="none" isRequired />
                <Input label={t("confirm-password-label")} type="password" variant="bordered" radius="none" isRequired />
             </div>
             <Button className="bg-[#b11116] text-white font-bold w-full md:w-40" radius="none">{t("update")}</Button>
          </div>
        );
       case "HISTORY":
        return (
          <div className="bg-white p-8 border border-gray-300 rounded-sm shadow-sm space-y-6">
             <h3 className="text-xl font-black border-b-2 border-black pb-2 uppercase italic text-[#b11116]">{t("transaction-history")}</h3>
             <div className="overflow-x-auto pt-4">
                 <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-100 uppercase text-[11px] font-bold text-gray-700">
                        <tr>
                            <th className="p-3 border">{t("trans-id")}</th>
                            <th className="p-3 border">{t("trans-time")}</th>
                            <th className="p-3 border">{t("cinemas")}</th>
                            <th className="p-3 border">{t("total")}</th>
                            <th className="p-3 border">{t("status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={5} className="p-10 text-center text-gray-400 italic font-medium">{t("no-transactions")}</td>
                        </tr>
                    </tbody>
                 </table>
             </div>
          </div>
        );
      case "VOUCHER":
        return (
          <div className="bg-white p-8 border border-gray-300 rounded-sm shadow-sm space-y-6">
             <h3 className="text-xl font-black border-b-2 border-black pb-2 uppercase italic text-[#b11116]">{t("my-vouchers")}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="border border-dashed border-red-400 bg-red-50 p-4 flex flex-row gap-4 items-center">
                    <div className="w-16 h-16 bg-[#b11116] text-white flex items-center justify-center font-bold text-xs rounded-sm shrink-0">VOUCHER</div>
                    <div>
                        <p className="font-bold text-[#b11116]">{t("discount-popcorn") || "20k Popcorn Discount"}</p>
                        <p className="text-[11px] text-gray-500">{t("expiry-date")}: 30/12/2026</p>
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
      <section className="bg-[#fcfbf7] min-h-screen py-10 md:py-20">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-[#b11116] font-black text-2xl uppercase mb-6 tracking-tight">{t("tnc-account")}</h2>
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative text-left px-5 py-3 text-[13px] font-bold transition-all duration-300 group
                      ${isActive 
                        ? "bg-[#e71a0f] text-white shadow-lg translate-x-1" 
                        : "bg-[#e1e1e1] text-[#666] hover:bg-gray-300 hover:text-black"
                      }`}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute top-0 right-[-14px] w-0 h-0 border-t-[19px] border-t-transparent border-b-[20px] border-b-transparent border-l-[14px] border-l-[#e71a0f]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow">
            {/* Breadcrumb Title Area */}
            <div className="bg-[#333] text-white p-2 px-6 rounded-t-sm mb-6 text-center font-black uppercase tracking-[0.2em]">
                {menuItems.find(i => i.id === activeTab)?.label}
            </div>

            {renderContent()}
          </main>
        </div>
      </section>
    </TNCLayout>
  );
}
