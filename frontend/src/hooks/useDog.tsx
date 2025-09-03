// src/hooks/useDog.ts
import { useEffect, useState } from "react";
import { dogAPI } from "../services/apis";
import type { DogInterface } from "../interfaces/Dog";

export function useDog(id: number | null) {
  const [dog, setDog] = useState<DogInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await dogAPI.getById(id); 
        setDog(res.data);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "โหลดข้อมูลน้องหมาไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { dog, loading, error };
}
