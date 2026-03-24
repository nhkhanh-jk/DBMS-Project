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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {/* Member */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-8 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-blue-500">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-md">M</div>
                <h3 className="text-2xl font-black text-[#333] mb-4">{t("tnc-member")}</h3>
                <ul className="text-sm text-gray-600 space-y-4 text-center leading-6">
                    <li>• {t("earn-5")}</li>
                    <li>• {t("birthday-gift-popcorn")}</li>
                    <li>• {t("redeem-points")}</li>
                    <li>• {t("early-news")}</li>
                </ul>
                <div className="mt-auto pt-8">
                    <Button className="bg-[#b11116] text-white font-black px-10" radius="none">{t("register-now")}</Button>
                </div>
            </div>

            {/* VIP */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-8 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-yellow-500 scale-105 md:z-10 bg-white">
                <div className="w-20 h-20 bg-yellow-500 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg border-4 border-white">V</div>
                <h3 className="text-2xl font-black text-[#333] mb-4">{t("tnc-vip")}</h3>
                <p className="text-[11px] font-bold text-yellow-600 uppercase mb-4 tracking-widest">{t("spending-2m")}</p>
                <ul className="text-sm text-gray-600 space-y-4 text-center leading-6">
                    <li>• {t("earn-7")}</li>
                    <li>• {t("birthday-gift-single")}</li>
                    <li>• {t("free-tickets-2")}</li>
                    <li>• {t("discount-10")}</li>
                </ul>
                <div className="mt-auto pt-8">
                    <Button className="bg-[#b11116] text-white font-black px-10 shadow-md" radius="none">{t("learn-more")}</Button>
                </div>
            </div>

            {/* VVIP */}
            <div className="flex flex-col items-center bg-[#f9f9f9] border border-gray-200 p-8 rounded-sm shadow-sm hover:shadow-xl transition-shadow border-t-8 border-gray-800">
                <div className="w-20 h-20 bg-gray-800 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-md">VV</div>
                <h3 className="text-2xl font-black text-[#333] mb-4">{t("tnc-vvip")}</h3>
                <p className="text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-widest">{t("spending-4m")}</p>
                <ul className="text-sm text-gray-600 space-y-4 text-center leading-6">
                    <li>• {t("earn-10")}</li>
                    <li>• {t("birthday-gift-couple")}</li>
                    <li>• {t("free-tickets-4")}</li>
                    <li>• {t("priority-booking")}</li>
                </ul>
                <div className="mt-auto pt-8">
                    <Button className="bg-[#b11116] text-white font-black px-10" radius="none">{t("login").toUpperCase()}</Button>
                </div>
            </div>
          </div>

          {/* Benefits Comparison Table */}
          <div className="bg-white border border-gray-300 rounded-sm overflow-hidden shadow-lg">
             <div className="bg-[#b11116] text-white p-5 text-center font-black uppercase tracking-widest text-lg">
                {t("benefit-comparison")}
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-sm font-black text-gray-700 uppercase border-b border-gray-300">
                        <tr>
                            <th className="p-6">{t("details")}</th>
                            <th className="p-6 text-center text-blue-600">MEMBER</th>
                            <th className="p-6 text-center text-yellow-600">VIP</th>
                            <th className="p-6 text-center text-gray-800">VVIP</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-6 font-bold uppercase text-[11px]">{t("benefit-rate") || "Point Rate"}</td>
                            <td className="p-6 text-center">5%</td>
                            <td className="p-6 text-center font-bold">7%</td>
                            <td className="p-6 text-center font-black text-black">10%</td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                            <td className="p-6 font-bold uppercase text-[11px]">{t("offer-3-title")}</td>
                            <td className="p-6 text-center italic">{t("popcorn") || "Popcorn"}</td>
                            <td className="p-6 text-center italic">Combo Single</td>
                            <td className="p-6 text-center italic font-bold">Combo Couple</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-6 font-bold uppercase text-[11px]">{t("free-tickets") || "Free Tickets"}</td>
                            <td className="p-6 text-center">-</td>
                            <td className="p-6 text-center">02</td>
                            <td className="p-6 text-center font-bold">04</td>
                        </tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                            <td className="p-6 font-bold uppercase text-[11px]">{t("priority-counter") || "Priority Counter"}</td>
                            <td className="p-6 text-center">-</td>
                            <td className="p-6 text-center">-</td>
                            <td className="p-6 text-center text-green-600 font-black">✓</td>
                        </tr>
                        <tr>
                            <td className="p-6 font-bold uppercase text-[11px]">{t("sneak-show") || "Sneakshow"}</td>
                            <td className="p-6 text-center">✓</td>
                            <td className="p-6 text-center font-bold">{t("priority") || "Priority"}</td>
                            <td className="p-6 text-center font-black text-black">{t("exclusive") || "Exclusive"}</td>
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
