// hooks/useAuth.tsx
import { useEffect, useState, useCallback } from "react";
import { authAPI } from "../services/apis";
import type { AppUserInterface } from "../interfaces/User";

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
      // ไม่มี token → เคลียร์สถานะและหยุดโหลด
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authAPI.me(); // ควรเรียกด้วย header Authorization ภายใน authAPI
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
      // token ไม่ถูกต้อง/หมดอายุ → ลบและเซ็ตสถานะออกจากระบบ
      localStorage.removeItem("token");
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

    // ถ้า tab อื่นเปลี่ยน token ให้รีเฟรช
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") refresh();
    };
    window.addEventListener("storage", onStorage);

    // โฟกัสหน้าเว็บกลับมา → รีเฟรชสถานะ (เช่น token เพิ่งรีเฟรช)
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
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
