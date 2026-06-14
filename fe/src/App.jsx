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

import NhanVienDashboard from "@/pages/nhanvien/index";
import NhanVienBanVe from "@/pages/nhanvien/ban-ve";
import NhanVienKiemTraVe from "@/pages/nhanvien/kiem-tra-ve";
import NhanVienLichChieu from "@/pages/nhanvien/lich-chieu";
import StaffLogin from "@/pages/nhanvien/login";

import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/nguoidung";
import AdminCinemas from "@/pages/admin/rap";
import AdminStaffs from "@/pages/admin/nhanvien";
import AdminMovies from "@/pages/admin/phim";
import AdminDuDoan from "@/pages/admin/du-doan";
import SuperAdminLogin from "@/pages/admin/login";

// Manager pages
import ManagerDashboard from "@/pages/quanly/index";
import ManagerBaoCaoPhim from "@/pages/quanly/bao-cao-phim";
import ManagerBaoCaoRap from "@/pages/quanly/bao-cao-rap";
import ManagerDoanhThu from "@/pages/quanly/doanh-thu";
import ManagerSuatChieu from "@/pages/quanly/suat-chieu";
import ManagerNhanVien from "@/pages/quanly/nhan-vien";
import ManagerLogin from "@/pages/quanly/login";

// Staff Protected Route
const StaffProtectedRoute = ({ children }) => {
  const raw = localStorage.getItem("tnc_user");
  const user = raw ? JSON.parse(raw) : null;
  
  if (!user || user.role !== "staff") {
    return <Navigate to="/nhanvien/login" replace />;
  }
  return children;
};

// Super Admin Protected Route
const SuperAdminProtectedRoute = ({ children }) => {
  const isSuperAdmin = localStorage.getItem("tnc_superadmin");
  if (!isSuperAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Manager Protected Route
const ManagerProtectedRoute = ({ children }) => {
  const isManager = localStorage.getItem("tnc_manager");
  if (!isManager) {
    return <Navigate to="/quanly/login" replace />;
  }
  return children;
};

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
        
        {/* Nhan vien routes */}
        <Route element={<StaffLogin />} path="/nhanvien/login" />
        <Route element={<StaffProtectedRoute><NhanVienDashboard /></StaffProtectedRoute>} path="/nhanvien" />
        <Route element={<StaffProtectedRoute><NhanVienBanVe /></StaffProtectedRoute>} path="/nhanvien/ban-ve" />
        <Route element={<StaffProtectedRoute><NhanVienKiemTraVe /></StaffProtectedRoute>} path="/nhanvien/kiem-tra-ve" />
        <Route element={<StaffProtectedRoute><NhanVienLichChieu /></StaffProtectedRoute>} path="/nhanvien/lich-chieu" />

        {/* Super Admin routes */}
        <Route element={<SuperAdminLogin />} path="/admin/login" />
        <Route element={<SuperAdminProtectedRoute><AdminDashboard /></SuperAdminProtectedRoute>} path="/admin" />
        <Route element={<SuperAdminProtectedRoute><AdminUsers /></SuperAdminProtectedRoute>} path="/admin/nguoidung" />
        <Route element={<SuperAdminProtectedRoute><AdminCinemas /></SuperAdminProtectedRoute>} path="/admin/rap" />
        <Route element={<SuperAdminProtectedRoute><AdminStaffs /></SuperAdminProtectedRoute>} path="/admin/nhanvien" />
        <Route element={<SuperAdminProtectedRoute><AdminMovies /></SuperAdminProtectedRoute>} path="/admin/phim" />
        <Route element={<SuperAdminProtectedRoute><AdminDuDoan /></SuperAdminProtectedRoute>} path="/admin/du-doan" />

        {/* Manager (Quan Ly) routes */}
        <Route element={<ManagerLogin />} path="/quanly/login" />
        <Route element={<ManagerProtectedRoute><ManagerDashboard /></ManagerProtectedRoute>} path="/quanly" />
        <Route element={<ManagerProtectedRoute><ManagerBaoCaoPhim /></ManagerProtectedRoute>} path="/quanly/bao-cao-phim" />
        <Route element={<ManagerProtectedRoute><ManagerBaoCaoRap /></ManagerProtectedRoute>} path="/quanly/bao-cao-rap" />
        <Route element={<ManagerProtectedRoute><ManagerDoanhThu /></ManagerProtectedRoute>} path="/quanly/doanh-thu" />
        <Route element={<ManagerProtectedRoute><ManagerSuatChieu /></ManagerProtectedRoute>} path="/quanly/suat-chieu" />
        <Route element={<ManagerProtectedRoute><ManagerNhanVien /></ManagerProtectedRoute>} path="/quanly/nhan-vien" />

        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
