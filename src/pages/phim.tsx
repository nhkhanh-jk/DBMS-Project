import { useState } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TNCLayout from "@/layouts/tnc";
import { slugify } from "@/utils/slugify";
import movies from "../data/movies";

const RankingMedal = ({ rank }: { rank: number }) => {
  if (rank <= 0 || rank > 3) return null;

  const config: Record<number, { bg: string, ring: string, iconColor: string }> = {
    1: { bg: "bg-[#e71a0f]", ring: "ring-[#e71a0f]/40", iconColor: "text-white" },
    2: { bg: "bg-[#f6a111]", ring: "ring-[#f6a111]/40", iconColor: "text-white" },
    3: { bg: "bg-[#337ab7]", ring: "ring-[#337ab7]/40", iconColor: "text-white" },
  };

  const { bg, ring } = config[rank];

  return (
    <div className={`absolute -top-3 -right-3 z-20 flex flex-col items-center select-none`}>
      <div className={`w-10 h-10 ${bg} rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-xl text-white ring-4 ${ring}`}>
        {rank}
      </div>
       <div className="-mt-1 flex gap-0.5">
          <div className={`w-2 h-4 ${bg} clip-path-ribbon opacity-90`}></div>
          <div className={`w-2 h-4 ${bg} clip-path-ribbon opacity-90`}></div>
       </div>
       <style>{`
          .clip-path-ribbon {
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%);
          }
       `}</style>
    </div>
  );
};

export default function PhimPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon" | "sneak-show">("now-showing");

  const filteredMovies = movies.filter(movie => movie.category === activeTab);

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen pt-10 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-black pb-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter">{t("movies")} TNC</h2>
              
              {/* Tab Buttons */}
              <div className="flex bg-gray-200 p-1 rounded-sm shadow-inner">
                <button 
                  onClick={() => setActiveTab("now-showing")}
                  className={`px-6 py-2 text-sm font-black uppercase transition-all duration-200 
                             ${activeTab === "now-showing" ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black hover:bg-white/50"}`}
                >
                  {t("now-showing")}
                </button>
                <button 
                  onClick={() => setActiveTab("coming-soon")}
                  className={`px-6 py-2 text-sm font-black uppercase transition-all duration-200 
                             ${activeTab === "coming-soon" ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black hover:bg-white/50"}`}
                >
                  {t("coming-soon")}
                </button>
                <button 
                  onClick={() => setActiveTab("sneak-show")}
                  className={`px-6 py-2 text-sm font-black uppercase transition-all duration-200 
                             ${activeTab === "sneak-show" ? "bg-[#e71a0f] text-white shadow-md" : "text-gray-600 hover:text-black hover:bg-white/50"}`}
                >
                  {t("sneak-show")}
                </button>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie, idx) => (
                <div key={idx} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Poster Container */}
                  <Link to={`/phim/${slugify(movie.title)}`} className="relative group mb-4 block">
                    <div className="border-[3px] border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)] overflow-hidden relative bg-black">
                      <Image
                        removeWrapper
                        alt={movie.title}
                        className="w-full h-[380px] object-cover transition-transform duration-500 group-hover:scale-105"
                        src={movie.image}
                      />
                      
                      {/* Rating Chip */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-[#f6c344]/95 border border-black/20 text-[#631115] font-black px-2 py-0.5 text-xs tracking-tight">
                          {movie.rating}
                        </div>
                      </div>

                      {/* Ranking Medal */}
                      <RankingMedal rank={movie.rank} />
                    </div>
                  </Link>

                  {/* Movie Details */}
                  <div className="flex-grow">
                    <h3 className="text-[17px] font-black uppercase leading-tight text-[#222] min-h-[44px] flex items-start">
                      {movie.title}
                    </h3>
                    
                    <div className="mt-2 text-[14px] leading-[1.6] text-[#333]">
                      <p><span className="font-bold">{t("genre")}:</span> {movie.genre}</p>
                      <p><span className="font-bold">{t("duration") || "Duration"}:</span> {movie.duration}</p>
                      <p><span className="font-bold">{t("release-date")}:</span> {movie.releaseDate}</p>
                    </div>
                  </div>

                  {/* Buy Ticket Button */}
                   <div className="mt-8 flex justify-center">
                    <Link to={`/phim/${slugify(movie.title)}`}>
                        <Button
                        className="bg-[#e71a0f] text-white font-black px-6 h-[38px] min-w-[130px] shadow-[0px_3px_0px_#a3120a] border border-black/10 hover:brightness-110 active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2"
                        radius="sm"
                        >
                        <p className="text-[15px] tracking-tight">🎫 {t("buy-ticket")}</p>
                        </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-20 text-center text-gray-400 italic font-medium">
                    {t("coming-soon")}...
                </div>
            )}
          </div>

        </div>
      </section>
    </TNCLayout>
  );
}
