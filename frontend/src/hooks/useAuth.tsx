
  import { useEffect, useState, useCallback } from "react";
  import { authAPI } from "../services/apis"; // หรือ ../services/apis แล้วแต่ path ของคุณ
  import type { AppUserInterface } from "../interfaces/User";

// hooks/useAuth.tsx
export function useAuthUser() {
  const [user, setUser] = useState<AppUserInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem("token"))
  );

  const refresh = useCallback(async () => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!hasToken) {
      // ✅ ต้องปิด loading ด้วย ไม่งั้นหน้าอื่นจะรอ !authLoading ตลอดไป
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      setLoading(false);            // <--- สำคัญ
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.me();
      if (!res) throw new Error("User data not found");

      const userForApp: AppUserInterface = {
        ID: res.ID,
        name: res.name,
        first_name: res.first_name,
        last_name: res.last_name,
        photo_url: res.photo_url,
        email: res.email,
        phone: res.phone,
        // ถ้ามี gender_id มากับ BE ก็เติมไว้
        gender_id: res.gender_id,
        gender: res.gender,
      };

      setUser(userForApp);
      setIsLoggedIn(true);
      setError(null);
    } catch (e) {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
    }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const logout = useCallback(() => {
    ["token", "token_type", "ID", "username", "email"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return { user, loading, error, isLoggedIn, refresh, logout };
}
