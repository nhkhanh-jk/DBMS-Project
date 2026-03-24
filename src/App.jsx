import { Route, Routes, Navigate } from "react-router-dom";

import { CookieConsentProvider } from "./contexts/cookie-consent-context";
import { CookieConsent } from "./components/cookie-consent";
import { PageNotFound } from "./pages/404";

import PhimPage from "@/pages/phim";
import RapPage from "@/pages/rap";
import RapChiTietPage from "@/pages/rap-chitiet";
import PhimChiTietPage from "./pages/phim-chitiet";
import UuDaiPage from "@/pages/uudai";
import ThanhVienPage from "@/pages/thanhvien";
import TaiKhoanPage from "@/pages/taikhoan";
import VeCuaToiPage from "@/pages/vecuatoi";
import DangKyPage from "@/pages/dangky";
import DangNhapPage from "@/pages/dangnhap";
import QuyDinhPage from "@/pages/quydinh";
import GioiThieuPage from "@/pages/gioithieu";
import TuyenDungPage from "@/pages/tuyendung";
import LienHePage from "@/pages/lienhe";
import FAQPage from "@/pages/faq";
import BaoMatPage from "@/pages/baomat";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        <Route element={<Navigate to="/phim" replace />} path="/" />
        <Route element={<PhimPage />} path="/phim" />
        <Route element={<PhimChiTietPage />} path="/phim/:slug" />
        <Route element={<RapPage />} path="/rap" />
        <Route element={<RapChiTietPage />} path="/rap/chitiet" />
        <Route element={<UuDaiPage />} path="/uudai" />
        <Route element={<ThanhVienPage />} path="/thanhvien" />
        <Route element={<TaiKhoanPage />} path="/taikhoan" />
        <Route element={<VeCuaToiPage />} path="/vecuatoi" />
        <Route element={<DangKyPage />} path="/dangky" />
        <Route element={<DangNhapPage />} path="/dangnhap" />
        <Route element={<QuyDinhPage />} path="/quydinh" />
        <Route element={<GioiThieuPage />} path="/gioithieu" />
        <Route element={<TuyenDungPage />} path="/tuyendung" />
        <Route element={<LienHePage />} path="/lienhe" />
        <Route element={<FAQPage />} path="/faq" />
        <Route element={<BaoMatPage />} path="/baomat" />
        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
