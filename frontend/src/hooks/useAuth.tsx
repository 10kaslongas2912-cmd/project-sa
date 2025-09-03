
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
      // res อาจเป็น any → cast ให้เป็น AppUser
      setUser(res as AppUserInterface);
      setIsLoggedIn(true);
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
    user,     
    loading,    
    error,   
    isLoggedIn, 
    refresh,   
    logout,  
  };
}
