import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TNCLayout from "@/layouts/tnc";
import { slugify } from "@/utils/slugify";
import movies from "../data/movies";

/* ─── SVG Icons ─────────────────────────────────────────── */
const TicketIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/* ─── Rank medal ─────────────────────────────────────────── */
const MEDAL_COLORS = {
  1: { ring: "ring-[#FFD700]/60", bg: "bg-gradient-to-b from-[#FFD700] to-[#B8860B]", text: "text-[#3d2000]" },
  2: { ring: "ring-[#C0C0C0]/60", bg: "bg-gradient-to-b from-[#C0C0C0] to-[#808080]", text: "text-[#222]" },
  3: { ring: "ring-[#CD7F32]/60", bg: "bg-gradient-to-b from-[#CD7F32] to-[#8B4513]", text: "text-white" },
};

function RankMedal({ rank }) {
  if (!rank || rank > 3) return null;
  const { ring, bg, text } = MEDAL_COLORS[rank];
  return (
    <div className={`absolute -top-2.5 -right-2.5 z-20 w-9 h-9 rounded-full ${bg} ${text} ring-2 ${ring} flex items-center justify-center font-black text-sm shadow-lg`}>
      {rank}
    </div>
  );
}

/* ─── Tab data ───────────────────────────────────────────── */
const TABS = [
  { key: "now-showing", labelKey: "now-showing" },
  { key: "coming-soon", labelKey: "coming-soon" },
  { key: "sneak-show",  labelKey: "sneak-show" },
];

/* ─── Movie card ─────────────────────────────────────────── */
function MovieCard({ movie }) {
  const { t } = useTranslation();
  return (
    <div className="group flex flex-col">
      {/* Poster */}
      <Link to={`/phim/${slugify(movie.title)}`} className="relative block overflow-hidden rounded-xl cursor-pointer">
        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[#12121E]">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Glow border on hover */}
        <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-[#b11116]/60 transition-all duration-300" />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#b11116] text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider shadow-lg">
            {movie.rating}
          </span>
        </div>

        {/* Rank medal */}
        <RankMedal rank={movie.rank} />

        {/* Hover overlay — "Mua vé" text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-2 bg-[#b11116] text-white text-sm font-black px-5 py-2.5 rounded-full shadow-xl">
            <TicketIcon />
            {t("buy-ticket")}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 flex-1 flex flex-col">
        <Link to={`/phim/${slugify(movie.title)}`} className="cursor-pointer">
          <h3 className="text-[15px] font-black text-white leading-snug hover:text-[#F5C344] transition-colors duration-150 line-clamp-2">
            {movie.title}
          </h3>
        </Link>
        <p className="text-[12px] text-white/40 mt-1 line-clamp-1">{movie.genre}</p>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
          <span className="flex items-center gap-1"><ClockIcon />{movie.duration}</span>
          <span className="flex items-center gap-1"><CalendarIcon />{movie.releaseDate}</span>
        </div>

        {/* CTA */}
        <div className="mt-3">
          <Link to={`/phim/${slugify(movie.title)}`} className="cursor-pointer">
            <button className="w-full flex items-center justify-center gap-2 bg-[#b11116] hover:bg-[#d4151b] text-white text-[13px] font-black py-2.5 rounded-lg transition-all duration-200 shadow-[0_3px_0_#7d0b12] hover:shadow-[0_2px_0_#7d0b12] active:shadow-none active:translate-y-[1px] cursor-pointer">
              <TicketIcon />
              {t("buy-ticket")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function PhimPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("now-showing");
  const filtered = movies.filter((m) => m.category === activeTab);

  return (
    <TNCLayout>
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#12121E] to-[#080812] border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <p className="text-[#b11116] text-xs font-black uppercase tracking-[0.3em] mb-2">TNC Cinema</p>
          <h1 className="text-3xl md:text-5xl font-black text-white">
            {t("movies")}
          </h1>
          <p className="text-white/40 mt-2 text-sm">Khám phá những bộ phim đang và sắp chiếu tại hệ thống rạp TNC</p>
        </div>
      </div>

      <section className="bg-[#080812] min-h-screen pt-8 pb-20">
        <div className="mx-auto max-w-7xl px-4">

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-10 border-b border-white/5 pb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                  ${activeTab === tab.key
                    ? "bg-[#b11116] text-white shadow-lg shadow-red-950/50"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Movie grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filtered.map((movie, idx) => (
                <MovieCard key={idx} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4 opacity-20">🎬</div>
              <p className="text-white/30 text-sm font-semibold">{t("coming-soon")}...</p>
            </div>
          )}

        </div>
      </section>
    </TNCLayout>
  );
}
