import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { apiRequest } from "@/utils/api";

export default function RapPage() {
  const [selectedCity, setSelectedCity] = useState("");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    apiRequest("/cinemas")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.cinemas || [];
        const grouped = list.reduce((acc, cinema) => {
          const city = cinema.city || cinema.location || "Khác";
          const key = city.toLowerCase();
          if (!acc[key]) acc[key] = { id: key, name: city, cinemas: [] };
          acc[key].cinemas.push({ id: cinema._id || cinema.id, name: cinema.name });
          return acc;
        }, {});
        const normalized = Object.values(grouped);
        setLocations(normalized);
        if (normalized.length > 0) setSelectedCity(normalized[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedData = useMemo(() => locations.find((l) => l.id === selectedCity), [locations, selectedCity]);

  return (
    <TNCLayout>
      <section className="bg-[#ede2cf] min-h-[60vh] py-14 px-4 flex justify-center">
        <div className="w-full max-w-5xl bg-[#2a2928] p-3 shadow-2xl relative overflow-hidden" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')" }}>
          <div className="border border-[#777] rounded-[1px] p-8 md:p-14 relative z-10">
            <h1 className="text-center text-4xl md:text-6xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-[#b3b3b3] to-[#7f7f7f] drop-shadow-md pb-12">TNC CINEMAS</h1>
            <hr className="border-[#4f4f4f] mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[15px] pb-8">
              {locations.map((loc) => (
                <button key={loc.id} onClick={() => setSelectedCity(loc.id)} className={`text-left font-semibold cursor-pointer transition-all hover:text-white px-2 ${selectedCity === loc.id ? "text-[#f83a3a]" : "text-[#d1d1d1]"}`}>
                  {loc.name}
                </button>
              ))}
            </div>
            <hr className="border-[0.5px] border-[#4f4f4f] border-dashed mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-[13px] text-[#cccccc]">
              {selectedData?.cinemas.map((cinema) => (
                <Link to={`/rap/chitiet?id=${cinema.id}`} key={cinema.id} className="font-medium hover:text-white cursor-pointer px-2 transition-colors duration-200 block">
                  {cinema.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
