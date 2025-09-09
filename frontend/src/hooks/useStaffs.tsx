import { useEffect, useState } from "react";
import { staffAPI } from "../services/apis";
import type { StaffInterface } from "../interfaces/Staff";

export function useStaffs() {
  const [staffs, setStaffs] = useState<StaffInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    useEffect(() => {
    (async () => {
        try {
        setLoading(true);
        const res = await staffAPI.getAll();
        setStaffs(res);
        setError(null);
        } catch (e: any) {
        setError(e?.message || "โหลดข้อมูลเจ้าหน้าที่ไม่สำเร็จ");
        } finally {
        setLoading(false);
        }
    })();
    }, []);

  return { staffs, loading, error };
}
