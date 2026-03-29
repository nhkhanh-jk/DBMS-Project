import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const GiftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const OFFER_COLORS = [
  { gradient: "from-[#b11116] to-[#7d0b12]", badge: "bg-[#F5C344] text-[#5c1f00]" },
  { gradient: "from-[#1d4ed8] to-[#1e3a8a]", badge: "bg-white text-blue-900" },
  { gradient: "from-[#7c3aed] to-[#4c1d95]", badge: "bg-[#F5C344] text-[#5c1f00]" },
];

export default function UuDaiPage() {
  const { t } = useTranslation();
  const offers = [
    { title: t("offer-1-title"), desc: t("offer-1-desc") },
    { title: t("offer-2-title"), desc: t("offer-2-desc") },
    { title: t("offer-3-title"), desc: t("offer-3-desc") },
  ];

  return (
    <TNCLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#12121E] to-[#080812] border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-8" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <p className="text-[#b11116] text-xs font-black uppercase tracking-[0.3em] mb-2">TNC Cinema</p>
          <h1 className="text-3xl md:text-5xl font-black text-white">{t("promotions")}</h1>
          <p className="text-white/40 mt-2 text-sm">Khám phá các ưu đãi hấp dẫn dành riêng cho thành viên TNC</p>
        </div>
      </div>

      <section className="bg-[#080812] min-h-screen py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[#b11116] text-xs font-black uppercase tracking-[0.25em]">{t("promotions")}</p>
              <h2 className="text-2xl font-black text-white mt-1">{t("promotions")} & Ưu đãi</h2>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
              {t("view-all")}
              <ArrowRightIcon />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {offers.map((offer, i) => (
              <div
                key={offer.title}
                className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#12121E] hover:border-white/15 transition-all duration-300 cursor-pointer"
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${OFFER_COLORS[i].gradient}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${OFFER_COLORS[i].badge}`}>
                      <GiftIcon />
                      {t("offer").toUpperCase()} {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mb-3 group-hover:text-[#F5C344] transition-colors duration-200">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-7">{offer.desc}</p>
                  <button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#b11116] hover:text-[#F5C344] transition-colors duration-150 cursor-pointer">
                    {t("details-view")}
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
