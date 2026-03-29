import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const raw = localStorage.getItem("tnc_user");
  if (!raw) return <Navigate to="/dangnhap" replace />;

  const user = JSON.parse(raw);
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dangnhap" replace />;

  return children;
}
