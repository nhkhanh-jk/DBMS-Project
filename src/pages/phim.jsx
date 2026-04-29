import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TNCLayout from "@/layouts/tnc";
import { slugify } from "@/utils/slugify";
import fallbackMovies from "../data/movies";
import { apiRequest } from "@/utils/api";

const RankingMedal = ({ rank }) => {
  if (rank <= 0 || rank > 3) return null;
  const config = {
    1: { bg: "bg-[#e71a0f]", ring: "ring-[#e71a0f]/40" },
    2: { bg: "bg-[#f6a111]", ring: "ring-[#f6a111]/40" },
    3: { bg: "bg-[#337ab7]", ring: "ring-[#337ab7]/40" },
  };
  const { bg, ring } = config[rank];
  return <div className={`absolute -top-3 -right-3 z-20 w-10 h-10 ${bg} rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-xl text-white ring-4 ${ring}`}>{rank}</div>;
};

export default function PhimPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("now-showing");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    
    // Mapping status FE tabs to API status
    const statusMap = {
        "now-showing": "DANG_CHIEU",
        "coming-soon": "SAP_CHIEU",
        "sneak-show": "SUAT_DAC_BIET"
    };

    apiRequest(`/movies?status=${statusMap[activeTab] || activeTab}`)
      .then((res) => {
        if (ignore) return;
        const list = res?.items || (Array.isArray(res) ? res : (res?.data || []));
        
        const normalized = list.map((m, idx) => ({
          category: activeTab,
          rank: idx + 1,
          title: m.title || m.name || m.TenPhim || "Untitled",
          genre: m.genre || m.genres?.join(", ") || m.TheLoai || "-",
          duration: (m.duration || m.ThoiLuong) ? `${m.duration || m.ThoiLuong} phút` : "-",
          releaseDate: m.releaseDate || m.NgayKhoiChieu ? new Date(m.releaseDate || m.NgayKhoiChieu).toLocaleDateString("vi-VN") : "-",
          rating: m.rating || m.DinhDang || "P",
          image: m.image || m.HinhAnh || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=200&q=60",
        }));
        setMovies(normalized);
      })
      .catch((err) => {
          console.error("Fetch movies failed", err);
          setMovies([]);
      })
      .finally(() => {
          if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen pt-10 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-black pb-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter">{t("movies")} TNC</h2>
            <div className="flex bg-gray-200 p-1 rounded-sm shadow-inner">
              {[
                { id: "now-showing", label: t("now-showing") },
                { id: "coming-soon", label: t("coming-soon") },
                { id: "sneak-show", label: t("sneak-show") },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-2 text-sm font-black uppercase transition-all duration-200 ${activeTab === tab.id ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black hover:bg-white/50"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                  {t("loading") || "Đang tải dữ liệu..."}
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {movies.length > 0 ? movies.map((movie, idx) => (
                <div key={idx} className="flex flex-col">
                    <Link to={`/phim/${slugify(movie.title)}`} className="relative group mb-4 block">
                    <div className="border-[3px] border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)] overflow-hidden relative bg-black">
                        <Image removeWrapper alt={movie.title} className="w-full h-[380px] object-cover transition-transform duration-500 group-hover:scale-105" src={movie.image} />
                        <div className="absolute top-3 left-3 z-10"><div className="bg-[#f6c344]/95 border border-black/20 text-[#631115] font-black px-2 py-0.5 text-xs tracking-tight">{movie.rating}</div></div>
                        <RankingMedal rank={movie.rank} />
                    </div>
                    </Link>
                    <div className="flex-grow">
                    <h3 className="text-[17px] font-black uppercase leading-tight text-[#222] min-h-[44px] flex items-start">{movie.title}</h3>
                    <div className="mt-2 text-[14px] leading-[1.6] text-[#333]">
                        <p><span className="font-bold">{t("genre")}:</span> {movie.genre}</p>
                        <p><span className="font-bold">{t("duration") || "Duration"}:</span> {movie.duration}</p>
                        <p><span className="font-bold">{t("release-date")}:</span> {movie.releaseDate}</p>
                    </div>
                    </div>
                    <div className="mt-8 flex justify-center">
                    <Link to={`/phim/${slugify(movie.title)}`}>
                        <Button className="bg-[#e71a0f] text-white font-black px-6 h-[38px] min-w-[130px]" radius="sm">
                        <p className="text-[15px] tracking-tight">🎫 {t("buy-ticket")}</p>
                        </Button>
                    </Link>
                    </div>
                </div>
                )) : <div className="col-span-full py-20 text-center text-gray-400 italic font-medium">{t("coming-soon")}...</div>}
            </div>
          )}
        </div>
      </section>
    </TNCLayout>
  );
}
