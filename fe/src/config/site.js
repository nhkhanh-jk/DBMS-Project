import i18next from "../i18n";

export const siteConfig = () => ({
  needCookieConsent: false,
  name: "TNC Cinema",
  description: "Hệ thống rạp chiếu phim TNC hiện đại, trải nghiệm điện ảnh đỉnh cao.",
  navItems: [
    {
      label: i18next.t("home") || "Trang chủ",
      href: "/",
    },
    {
      label: i18next.t("movies") || "Phim",
      href: "/phim",
    },
    {
      label: i18next.t("cinemas") || "Rạp TNC",
      href: "/rap",
    },
    {
      label: i18next.t("promotions") || "Ưu đãi",
      href: "/uudai",
    },
    {
      label: i18next.t("membership") || "Thành viên",
      href: "/thanhvien",
    },
  ],
  navMenuItems: [
    {
      label: i18next.t("profile") || "Thông tin tài khoản",
      href: "/taikhoan",
    },
    {
      label: i18next.t("my-tickets") || "Vé của tôi",
      href: "/vecuatoi",
    },
  ],
  links: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
});

