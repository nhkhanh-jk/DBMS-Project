import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

export default function ThanhVienPage() {
  const { t } = useTranslation();
  return (
    <TNCLayout>
      <section className="bg-white min-h-screen pb-20">
        {/* Banner Section */}
        <div className="w-full h-[300px] md:h-[450px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
            <img 
                src="https://images.unsplash.com/photo-1485846234645-a62644ef7467?auto=format&fit=crop&w=1200&q=80" 
                className="w-full h-full object-cover opacity-40 absolute inset-0" 
                alt="Membership Banner" 
            />
            <div className="relative text-center z-10 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-[#f6c344] uppercase tracking-tighter mb-4 italic" style={{ textShadow: "4px 4px 0 #b11116" }}>
                    {t("membership-header")}
                </h1>
                <p className="text-white text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                    {t("membership-subheader")}
                </p>
            </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 mt-16">
          
          {/* Intro Section */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-[#333] mb-6 uppercase tracking-widest relative inline-block">
                {t("loyalty-program")}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#b11116]"></div>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-7 text-lg mt-8">
                {t("loyalty-desc")}
            </p>
          </div>

          {/* Membership Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-24">
            {/* DONG */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-orange-400">
                <div className="w-16 h-16 bg-orange-400 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-md">Đ</div>
                <h3 className="text-xl font-black text-[#333] mb-4 text-center">{t("tier-bronze")}</h3>
                <ul className="text-xs text-gray-600 space-y-3 text-center leading-5 flex-grow">
                    <li>• {t("earn-5")}</li>
                    <li>• {t("birthday-gift-popcorn")}</li>
                    <li>• {t("redeem-points")}</li>
                    <li>• {t("early-news")}</li>
                </ul>
                <div className="mt-6 pt-4 w-full">
                    <Button className="bg-[#b11116] text-white font-black w-full" radius="none">{t("register-now")}</Button>
                </div>
            </div>

            {/* BAC */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-gray-400">
                <div className="w-16 h-16 bg-gray-400 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-md">B</div>
                <h3 className="text-xl font-black text-[#333] mb-4 text-center">{t("tier-silver")}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest text-center">{t("spending-2m")}</p>
                <ul className="text-xs text-gray-600 space-y-3 text-center leading-5 flex-grow">
                    <li>• {t("earn-7")}</li>
                    <li>• {t("birthday-gift-single")}</li>
                    <li>• {t("free-tickets-2")}</li>
                    <li>• {t("discount-10")}</li>
                </ul>
                <div className="mt-6 pt-4 w-full">
                    <Button className="bg-gray-800 text-white font-black w-full shadow-md" radius="none">{t("learn-more")}</Button>
                </div>
            </div>

            {/* VANG */}
            <div className="flex flex-col items-center border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-yellow-500 lg:scale-105 z-10 bg-white">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-lg border-2 border-white">V</div>
                <h3 className="text-xl font-black text-[#333] mb-4 text-center">{t("tier-gold")}</h3>
                <p className="text-[10px] font-bold text-yellow-600 uppercase mb-4 tracking-widest text-center">{t("spending-4m")}</p>
                <ul className="text-xs text-gray-600 space-y-3 text-center leading-5 flex-grow">
                    <li>• {t("earn-10")}</li>
                    <li>• {t("birthday-gift-couple")}</li>
                    <li>• {t("free-tickets-4")}</li>
                    <li>• {t("priority-booking")}</li>
                </ul>
                <div className="mt-6 pt-4 w-full">
                    <Button className="bg-[#b11116] text-white font-black w-full shadow-md" radius="none">{t("learn-more")}</Button>
                </div>
            </div>

            {/* KIM CUONG */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-blue-600">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-md">K</div>
                <h3 className="text-xl font-black text-[#333] mb-4 text-center">{t("tier-diamond")}</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-4 tracking-widest text-center">{t("spending-10m")}</p>
                <ul className="text-xs text-gray-600 space-y-3 text-center leading-5 flex-grow">
                    <li>• {t("earn-15")}</li>
                    <li>• {t("birthday-gift-couple")}</li>
                    <li>• {t("free-tickets-10")}</li>
                    <li>• {t("priority-booking")}</li>
                </ul>
                <div className="mt-6 pt-4 w-full">
                    <Button className="bg-blue-800 text-white font-black w-full shadow-md" radius="none">{t("learn-more")}</Button>
                </div>
            </div>
          </div>

          {/* Benefits Comparison Table */}
          <div className="bg-white border border-gray-300 rounded-sm overflow-hidden shadow-lg">
             <div className="bg-[#b11116] text-white p-5 text-center font-black uppercase tracking-widest text-lg">
                {t("benefit-comparison")}
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-100 text-sm font-black text-gray-700 uppercase border-b border-gray-300">
                        <tr>
                            <th className="p-4 md:p-6">{t("details")}</th>
                            <th className="p-4 md:p-6 text-center text-orange-600">ĐỒNG</th>
                            <th className="p-4 md:p-6 text-center text-gray-500">BẠC</th>
                            <th className="p-4 md:p-6 text-center text-yellow-600">VÀNG</th>
                            <th className="p-4 md:p-6 text-center text-blue-600">KIM CƯƠNG</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-4 md:p-6 font-bold uppercase text-[11px]">{t("benefit-rate") || "Point Rate"}</td>
                            <td className="p-4 md:p-6 text-center font-bold text-orange-600">5%</td>
                            <td className="p-4 md:p-6 text-center font-bold text-gray-500">7%</td>
                            <td className="p-4 md:p-6 text-center font-black text-yellow-600">10%</td>
                            <td className="p-4 md:p-6 text-center font-black text-blue-600">15%</td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                            <td className="p-4 md:p-6 font-bold uppercase text-[11px]">{t("offer-3-title")}</td>
                            <td className="p-4 md:p-6 text-center italic">{t("popcorn") || "Popcorn"}</td>
                            <td className="p-4 md:p-6 text-center italic">Combo Single</td>
                            <td className="p-4 md:p-6 text-center italic font-bold">Combo Couple</td>
                            <td className="p-4 md:p-6 text-center italic font-bold text-blue-600">Combo Couple VIP</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-4 md:p-6 font-bold uppercase text-[11px]">{t("free-tickets") || "Free Tickets"}</td>
                            <td className="p-4 md:p-6 text-center">-</td>
                            <td className="p-4 md:p-6 text-center font-bold text-gray-500">02</td>
                            <td className="p-4 md:p-6 text-center font-black text-yellow-600">04</td>
                            <td className="p-4 md:p-6 text-center font-black text-blue-600">10</td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                            <td className="p-4 md:p-6 font-bold uppercase text-[11px]">{t("priority-counter") || "Priority Counter"}</td>
                            <td className="p-4 md:p-6 text-center">-</td>
                            <td className="p-4 md:p-6 text-center">-</td>
                            <td className="p-4 md:p-6 text-center text-green-600 font-black">✓</td>
                            <td className="p-4 md:p-6 text-center text-green-600 font-black">✓</td>
                        </tr>
                        <tr>
                            <td className="p-4 md:p-6 font-bold uppercase text-[11px]">{t("sneak-show") || "Sneakshow"}</td>
                            <td className="p-4 md:p-6 text-center">✓</td>
                            <td className="p-4 md:p-6 text-center font-bold">{t("priority") || "Priority"}</td>
                            <td className="p-4 md:p-6 text-center font-black text-black">{t("priority") || "Priority"}</td>
                            <td className="p-4 md:p-6 text-center font-black text-blue-600">{t("exclusive") || "Exclusive"}</td>
                        </tr>
                    </tbody>
                </table>
             </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-24 text-center p-12 bg-[#b11116] rounded-sm text-white shadow-xl flex flex-col items-center">
             <h3 className="text-3xl font-black mb-4 uppercase italic">{t("start-journey")}</h3>
             <p className="opacity-80 max-w-xl mb-8">{t("cta-desc")}</p>
             <div className="flex gap-4">
                <Button size="lg" className="bg-white text-[#b11116] font-black px-10 h-12 hover:scale-105 transition-transform" radius="none">{t("register").toUpperCase()}</Button>
                <Button size="lg" variant="bordered" className="border-2 border-white text-white font-black px-10 h-12 hover:bg-white hover:text-[#b11116] transition-all" radius="none">{t("login").toUpperCase()}</Button>
             </div>
          </div>

        </div>
      </section>
    </TNCLayout>
  );
}
