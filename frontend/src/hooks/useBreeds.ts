import { useEffect, useState } from "react";
import type { BreedInterface } from "../interfaces/Breed";
import { breedAPI } from "../services/apis";
// ถ้ายังไม่มี breedAPI: ใช้ fetch แบบนี้แทนได้
// const breedAPI = { getAll: async () => (await fetch("/breeds")).json() };

export function useBreeds() {
  const [breeds, setBreeds] = useState<BreedInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await breedAPI.getAll(); // -> BreedInterface[]
        setBreeds(res || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "โหลดรายการสายพันธุ์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { breeds, loading, error };
}
