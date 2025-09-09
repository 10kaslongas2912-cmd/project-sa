import { useEffect, useState } from "react";
import type { AnimalSizeInterface } from "../interfaces/AnimalSize";
import { animalSizeAPI } from "../services/apis";
// ถ้ายังไม่มี API: const animalSizeAPI = { getAll: async () => (await fetch("/animal-sizes")).json() };

export function useAnimalSizes() {
  const [sizes, setSizes] = useState<AnimalSizeInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await animalSizeAPI.getAll(); // -> AnimalSizeInterface[]
        setSizes(res || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "โหลดรายการขนาดไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { sizes, loading, error };
}
