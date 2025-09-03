
import { useEffect, useState, useCallback } from "react";
import { authAPI } from "../services/apis"; // หรือ ../services/apis แล้วแต่ path ของคุณ
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
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.me();
      if (res) {
        const userForApp: AppUserInterface = {
          id: res.ID,
          name: res.name,
          firstname: res.firstname,
          lastname: res.lastname,
          photo_url: res.photo_url,
        };
  
        setUser(userForApp);
        setIsLoggedIn(true);
      } else {
        throw new Error("User data not found");
      }

      setError(null);
    } catch (e) {
      localStorage.removeItem("token"); // เผื่อ token หมดอายุ
      setUser(null);
      setIsLoggedIn(false);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // รองรับกรณี login/logout ในอีกแท็บ
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);
  const logout = useCallback(() => {
    ["token", "token_type", "id",  "username", "email"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return {
    user,        // ข้อมูล user หรือ null
    loading,     // true ตอนกำลังโหลด / false ตอนเสร็จ
    error,       // error object ถ้า fetch fail
    isLoggedIn,  // boolean
    refresh,     // ฟังก์ชัน manual refresh
    logout,      // ฟังก์ชัน logout
  };
}
