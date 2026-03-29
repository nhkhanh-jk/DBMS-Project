import { Route, Routes, Navigate } from "react-router-dom";

import { CookieConsentProvider } from "./contexts/cookie-consent-context";
import { CookieConsent } from "./components/cookie-consent";
import ProtectedRoute from "./components/protected-route";
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

// Admin pages
import AdminDashboard from "@/pages/admin/index";
import AdminNguoiDung from "@/pages/admin/nguoidung";
import AdminPhim from "@/pages/admin/phim";
import AdminRap from "@/pages/admin/rap";
import AdminNhanVien from "@/pages/admin/nhanvien";

// Staff pages
import StaffDashboard from "@/pages/nhanvien/index";
import BanVe from "@/pages/nhanvien/ban-ve";
import KiemTraVe from "@/pages/nhanvien/kiem-tra-ve";
import LichChieu from "@/pages/nhanvien/lich-chieu";

// Manager pages
import ManagerDashboard from "@/pages/quanly/index";
import DoanhThu from "@/pages/quanly/doanh-thu";
import BaoCaoPhim from "@/pages/quanly/bao-cao-phim";
import BaoCaoRap from "@/pages/quanly/bao-cao-rap";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        {/* Public routes */}
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

        {/* Admin routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/nguoidung"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminNguoiDung /></ProtectedRoute>}
        />
        <Route
          path="/admin/phim"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminPhim /></ProtectedRoute>}
        />
        <Route
          path="/admin/rap"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminRap /></ProtectedRoute>}
        />
        <Route
          path="/admin/nhanvien"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminNhanVien /></ProtectedRoute>}
        />

        {/* Staff routes */}
        <Route
          path="/nhanvien"
          element={<ProtectedRoute allowedRoles={["staff", "admin"]}><StaffDashboard /></ProtectedRoute>}
        />
        <Route
          path="/nhanvien/ban-ve"
          element={<ProtectedRoute allowedRoles={["staff", "admin"]}><BanVe /></ProtectedRoute>}
        />
        <Route
          path="/nhanvien/kiem-tra-ve"
          element={<ProtectedRoute allowedRoles={["staff", "admin"]}><KiemTraVe /></ProtectedRoute>}
        />
        <Route
          path="/nhanvien/lich-chieu"
          element={<ProtectedRoute allowedRoles={["staff", "admin"]}><LichChieu /></ProtectedRoute>}
        />

        {/* Manager routes */}
        <Route
          path="/quanly"
          element={<ProtectedRoute allowedRoles={["manager", "admin"]}><ManagerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/quanly/doanh-thu"
          element={<ProtectedRoute allowedRoles={["manager", "admin"]}><DoanhThu /></ProtectedRoute>}
        />
        <Route
          path="/quanly/bao-cao-phim"
          element={<ProtectedRoute allowedRoles={["manager", "admin"]}><BaoCaoPhim /></ProtectedRoute>}
        />
        <Route
          path="/quanly/bao-cao-rap"
          element={<ProtectedRoute allowedRoles={["manager", "admin"]}><BaoCaoRap /></ProtectedRoute>}
        />

        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
