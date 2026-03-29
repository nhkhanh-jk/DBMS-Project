import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TIERS = [
  {
    id: "member",
    label: "MEMBER",
    initial: "M",
    color: "from-blue-600 to-blue-400",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
    threshold: null,
    perks: ["earn-5", "birthday-gift-popcorn", "redeem-points", "early-news"],
  },
  {
    id: "vip",
    label: "VIP",
    initial: "V",
    color: "from-[#F5C344] to-[#c49a00]",
    borderColor: "border-[#F5C344]/40",
    textColor: "text-[#F5C344]",
    threshold: "spending-2m",
    perks: ["earn-7", "birthday-gift-single", "free-tickets-2", "discount-10"],
    featured: true,
  },
  {
    id: "vvip",
    label: "VVIP",
    initial: "VV",
    color: "from-white/90 to-white/50",
    borderColor: "border-white/20",
    textColor: "text-white",
    threshold: "spending-4m",
    perks: ["earn-10", "birthday-gift-couple", "free-tickets-4", "priority-booking"],
  },
];

const TABLE_ROWS = [
  { key: "benefit-rate", values: ["5%", "7%", "10%"] },
  { key: "offer-3-title", values: ["Popcorn", "Combo Single", "Combo Couple"] },
  { key: "free-tickets", values: ["—", "02", "04"] },
  { key: "priority-counter", values: ["—", "—", "✓"] },
  { key: "sneak-show", values: ["✓", "Priority", "Exclusive"] },
];

export default function ThanhVienPage() {
  const { t } = useTranslation();
  return (
    <TNCLayout>
      {/* Hero banner */}
      <div className="relative h-[280px] md:h-[380px] overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1485846234645-a62644ef7467?auto=format&fit=crop&w=1400&q=70"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          alt="Membership"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-[#080812]/50 to-transparent" />
        <div className="relative text-center z-10 px-4">
          <p className="text-[#b11116] text-xs font-black uppercase tracking-[0.3em] mb-2">TNC Cinema</p>
          <h1
            className="text-4xl md:text-6xl font-black text-[#F5C344] uppercase italic"
            style={{ textShadow: "3px 3px 0 #b11116" }}
          >
            {t("membership-header")}
          </h1>
          <p className="text-white/60 text-base md:text-xl font-semibold mt-3 max-w-xl mx-auto">
            {t("membership-subheader")}
          </p>
        </div>
      </div>

      <section className="bg-[#080812] min-h-screen pb-20">
        <div className="mx-auto max-w-6xl px-4 pt-14">

          {/* Intro */}
          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-4">
              {t("loyalty-program")}
              <div className="h-0.5 w-16 bg-[#b11116] mx-auto mt-3 rounded-full" />
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto leading-7 text-sm mt-6">{t("loyalty-desc")}</p>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col bg-[#12121E] rounded-2xl border ${tier.borderColor} p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50
                  ${tier.featured ? "ring-1 ring-[#F5C344]/30 scale-105 shadow-2xl" : ""}`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F5C344] text-[#5c1f00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-[#12121E] font-black text-lg mb-3 shadow-lg`}>
                    {tier.initial}
                  </div>
                  <h3 className={`text-xl font-black ${tier.textColor}`}>TNC {tier.label}</h3>
                  {tier.threshold && (
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-1">{t(tier.threshold)}</p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk} className={`flex items-start gap-2.5 text-sm ${tier.textColor} opacity-80`}>
                      <CheckIcon />
                      <span>{t(perk)}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/dangky">
                  <button className={`w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer
                    ${tier.featured
                      ? "bg-[#F5C344] text-[#5c1f00] hover:bg-[#ffd97d] shadow-lg shadow-amber-900/30"
                      : "border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`}>
                    {tier.id === "member" ? t("register-now") : t("learn-more")}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-[#12121E] rounded-2xl border border-white/5 overflow-hidden">
            <div className="bg-[#b11116] px-5 py-4 text-center">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">{t("benefit-comparison")}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-white/40 text-xs uppercase tracking-wider font-black">{t("details")}</th>
                    <th className="px-6 py-3 text-blue-400 text-xs uppercase tracking-wider font-black text-center">MEMBER</th>
                    <th className="px-6 py-3 text-[#F5C344] text-xs uppercase tracking-wider font-black text-center">VIP</th>
                    <th className="px-6 py-3 text-white/80 text-xs uppercase tracking-wider font-black text-center">VVIP</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map((row, i) => (
                    <tr key={row.key} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                      <td className="px-6 py-3.5 text-white/50 font-bold uppercase text-[11px]">{t(row.key) || row.key}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className={`px-6 py-3.5 text-center font-semibold
                          ${j === 1 ? "text-[#F5C344]" : j === 2 ? "text-white" : "text-white/50"}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center bg-gradient-to-br from-[#b11116] to-[#7d0b12] rounded-2xl p-10 shadow-2xl shadow-red-950/50">
            <h3 className="text-2xl font-black text-white uppercase italic mb-3">{t("start-journey")}</h3>
            <p className="text-white/70 max-w-md mx-auto text-sm leading-7 mb-7">{t("cta-desc")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dangky">
                <button className="px-8 py-3 bg-white text-[#b11116] font-black rounded-full hover:bg-[#F5C344] hover:text-[#5c1f00] transition-all duration-200 cursor-pointer shadow-lg">
                  {t("register").toUpperCase()}
                </button>
              </Link>
              <Link to="/dangnhap">
                <button className="px-8 py-3 border-2 border-white/40 text-white font-black rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer">
                  {t("login").toUpperCase()}
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </TNCLayout>
  );
}
