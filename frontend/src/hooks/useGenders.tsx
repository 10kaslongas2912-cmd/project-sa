// src/hooks/useGenders.ts
import { useEffect, useState } from "react";
import { genderAPI } from "../services/apis";
import type { GenderInterface } from "../interfaces/Gender";

export function useGenders() {
  const [genders, setGenders] = useState<GenderInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await genderAPI.getAll();
        if (active) {
          setGenders(Array.isArray(res) ? res : []);
          setError(null);
        }
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดข้อมูลเพศไม่สำเร็จ");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { genders, loading, error };
}
