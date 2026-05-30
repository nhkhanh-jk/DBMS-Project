export const translateGenre = (genreStr, lang) => {
  if (!genreStr) return "";
  if (lang !== "en-US") return genreStr;

  const genreMap = {
    "hồi hộp": "Thriller",
    "kinh dị": "Horror",
    "gia đình": "Family",
    "hài": "Comedy",
    "hoạt hình": "Animation",
    "phiêu lưu": "Adventure",
    "khoa học viễn tưởng": "Sci-Fi",
    "viễn tưởng": "Fantasy",
    "hành động": "Action",
    "hình sự": "Crime",
    "hàn quốc": "Korean"
  };

  return genreStr
    .split(",")
    .map(g => {
      const trimmed = g.trim();
      const lower = trimmed.toLowerCase();
      return genreMap[lower] || trimmed;
    })
    .join(", ");
};

export const translateDuration = (durationStr, lang) => {
  if (!durationStr) return "";
  if (lang !== "en-US") return durationStr;

  // e.g. "126 phút 26 giây" -> "126 mins 26 secs"
  // e.g. "105 phút" -> "105 mins"
  return durationStr
    .replace(/phút/g, "mins")
    .replace(/giây/g, "secs");
};

export const translateFormat = (formatStr, lang) => {
  if (!formatStr) return "";
  if (lang !== "en-US") return formatStr;

  const formatMap = {
    "2D Phụ Đề Anh": "2D English Subtitles",
    "2D Lồng Tiếng": "2D Dubbed",
    "2D Phụ Đề Việt": "2D Vietnamese Subtitles",
    "IMAX Phụ Đề Anh": "IMAX English Subtitles",
    "4DX Phụ Đề Việt": "4DX Vietnamese Subtitles",
    "2D Việt Nam": "2D Vietnamese"
  };

  return formatMap[formatStr] || formatStr;
};

export const translateCinemaAddress = (addressStr, lang) => {
  if (!addressStr) return "";
  if (lang !== "en-US") return addressStr;

  if (addressStr.includes("Vincom Đà Nẵng")) {
    return "4th Floor, Vincom Plaza Da Nang, Ngo Quyen Street, An Hai Bac Ward, Son Tra District, Da Nang City";
  }

  return addressStr;
};

export const translateRegion = (regionName, lang) => {
  if (!regionName) return "";
  if (lang !== "en-US") return regionName;

  const regionMap = {
    "Hồ Chí Minh": "Ho Chi Minh City",
    "Đà Nẵng": "Da Nang",
    "Hà Nội": "Ha Noi"
  };

  return regionMap[regionName] || regionName;
};
