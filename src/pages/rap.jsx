import { useState } from "react";
import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";

const locations = [
  {
    id: "hcm",
    name: "Hồ Chí Minh",
    cinemas: [
      "TNC Vincom Landmark 81",
      "TNC SC VivoCity",
      "TNC Hoàng Văn Thụ"
    ],
  },
  {
    id: "hn",
    name: "Hà Nội",
    cinemas: [
      "TNC Vincom Bà Triệu",
      "TNC Vincom Royal City",
      "TNC Vincom Times City"
    ],
  },
  {
    id: "dn",
    name: "Đà Nẵng",
    cinemas: [
      "TNC Vĩnh Trung Plaza"
    ],
  },
];

export default function RapPage() {
  const [selectedCity, setSelectedCity] = useState("hcm");

  const selectedData = locations.find((l) => l.id === selectedCity);

  return (
    <TNCLayout>
      {/* Background container wrapper */}
      <section className="bg-[#080812] min-h-[60vh] py-14 px-4 flex justify-center">

        {/* The Dark Ticket/Board Container */}
        <div className="w-full max-w-5xl bg-[#2a2928] p-3 shadow-2xl relative overflow-hidden"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')" }}>

          {/* Inner Decorative Frame */}
          <div className="border border-[#777] rounded-[1px] p-8 md:p-14 relative z-10 
                          before:content-[''] before:absolute before:top-[-4px] before:left-[-4px] before:w-[20px] before:h-[20px] before:border-l-[4px] before:border-t-[4px] before:border-[#2a2928] before:z-20
                          after:content-[''] after:absolute after:top-[-4px] after:right-[-4px] after:w-[20px] after:h-[20px] after:border-r-[4px] after:border-t-[4px] after:border-[#2a2928] after:z-20">

            {/* Corner cutouts for bottom left/right via spans since before/after are used */}
            <span className="absolute bottom-[-4px] left-[-4px] w-[20px] h-[20px] border-l-[4px] border-b-[4px] border-[#2a2928] z-20"></span>
            <span className="absolute bottom-[-4px] right-[-4px] w-[20px] h-[20px] border-r-[4px] border-b-[4px] border-[#2a2928] z-20"></span>

            {/* Title */}
            <h1 className="text-center text-4xl md:text-6xl font-black tracking-[0.1em] text-transparent bg-clip-text 
                           bg-gradient-to-b from-[#b3b3b3] to-[#7f7f7f] drop-shadow-md pb-12"
              style={{ textShadow: "1px 1px 2px #b10202ff, -1px -1px 1px #b10202ff" }}>
              TNC CINEMAS
            </h1>

            <hr className="border-[#4f4f4f] mb-8" />

            {/* Cities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[15px] pb-8">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedCity(loc.id)}
                  className={`text-left font-semibold cursor-pointer transition-all hover:text-white px-2
                              ${selectedCity === loc.id ? "text-[#f83a3a]" : "text-[#d1d1d1]"}`}
                >
                  {loc.name}
                </button>
              ))}
            </div>

            <hr className="border-[0.5px] border-[#4f4f4f] border-dashed mb-8" />

            {/* Cinemas Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-[13px] text-[#cccccc]">
              {selectedData?.cinemas.map((cinema, index) => (
                <Link
                  to="/rap/chitiet"
                  key={index}
                  className="font-medium hover:text-white cursor-pointer px-2 transition-colors duration-200 block"
                >
                  {cinema}
                </Link>
              ))}
            </div>

          </div>
        </div>

      </section>
    </TNCLayout>
  );
}
