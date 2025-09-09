// src/hooks/useDogs.ts
import { useEffect, useState, useCallback } from "react";
import { dogAPI } from "../services/apis";
import type { DogInterface } from "../interfaces/Dog";

export function useDogs() {
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dogAPI.getAll(); 
      setDogs(res || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "โหลดข้อมูลน้องหมาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { dogs, loading, error, refetch };
}
