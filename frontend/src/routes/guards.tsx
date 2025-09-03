// src/routes/guards.tsx
import { Navigate, useLocation } from "react-router-dom";

const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  const type  = localStorage.getItem("token_type");
  return Boolean(token && type);
};

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const loc = useLocation();

  if (!isLoggedIn()) {
    // จดจำหน้าเดิมไว้ สำหรับเด้งกลับหลังล็อกอิน
    sessionStorage.setItem("returnTo", loc.pathname + loc.search);
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export const GuestOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // ถ้าล็อกอินแล้ว ไม่ต้องให้เข้า /auth
  if (isLoggedIn()) {
    const ret = sessionStorage.getItem("returnTo");
    sessionStorage.removeItem("returnTo");
    return <Navigate to={ret || "/"} replace />;
  }
  return children;
};
