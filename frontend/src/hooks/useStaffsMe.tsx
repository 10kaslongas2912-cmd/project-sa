// hooks/useStaffMe.ts
import { useCallback, useEffect, useState } from "react";
import type { AppStaffInterface } from "../interfaces/Staff";
import { staffAuthAPI } from "../services/apis";

type UseStaffMeOptions = {
  autoFetch?: boolean; 
};

export function useStaffMe(options: UseStaffMeOptions = {}) {
  const { autoFetch = true } = options;
  const [staff, setStaff] = useState<AppStaffInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffAuthAPI.me();
      setStaff(res as AppStaffInterface);
      setLoading(false);
      return res as AppStaffInterface;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "โหลดข้อมูลพนักงานไม่สำเร็จ";
      setError(msg);
      setStaff(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }
    // ✅ ใช้ sessionStorage แทน localStorage
    const token = sessionStorage.getItem("token");
    const type = sessionStorage.getItem("userType");
    if (token && type === "staff") {
      refresh();
    } else {
      setLoading(false);
    }
  }, [autoFetch, refresh]);

  return { staff, loading, error, refresh };
}
