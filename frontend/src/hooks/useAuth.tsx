// hooks/useAuth.tsx
import { useEffect, useState, useCallback } from "react";
import { authAPI } from "../services/apis";
import type { AppUserInterface } from "../interfaces/User";

export function useAuthUser() {
  const [user, setUser] = useState<AppUserInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(sessionStorage.getItem("token")) &&
      (sessionStorage.getItem("userType") === "user" || !sessionStorage.getItem("userType"))
  );

  const refresh = useCallback(async () => {
    const hasToken =
      Boolean(sessionStorage.getItem("token")) &&
      (sessionStorage.getItem("userType") === "user" || !sessionStorage.getItem("userType"));

    if (!hasToken) {
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await authAPI.me(); // ควรได้ object user ตรง ๆ (เพราะ https.Get คืน res.data)
      if (!res) throw new Error("User data not found");

      const userForApp: AppUserInterface = {
        ID: res.ID,
        name: res.name,
        first_name: res.first_name,
        last_name: res.last_name,
        photo_url: res.photo_url,
        email: res.email,
        phone: res.phone,
        gender_id: res.gender_id,
        gender: res.gender,
      };

      setUser(userForApp);
      setIsLoggedIn(true);
    } catch (e: any) {
      // ล้างเฉพาะ sessionStorage ตามนโยบายใหม่
      ["token", "token_type", "ID", "username", "email", "userType", "isLogin"].forEach((k) =>
        sessionStorage.removeItem(k)
      );
      setUser(null);
      setIsLoggedIn(false);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // โหลดตอนเมาท์
    refresh();

    // โฟกัสหน้าเว็บกลับมา → รีเฟรชสถานะ
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const logout = useCallback(() => {
    ["token", "token_type", "ID", "username", "email", "userType", "isLogin"].forEach((k) =>
      sessionStorage.removeItem(k)
    );
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return { user, loading, error, isLoggedIn, refresh, logout };
}