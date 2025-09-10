import { useEffect, useState } from "react";
import type { AnimalSexInterface } from "../interfaces/AnimalSex";
import { animalSexAPI } from "../services/apis";

export function useAnimalSexes() {
  const [sexes, setSexes] = useState<AnimalSexInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await animalSexAPI.getAll(); // -> AnimalSexInterface[]
        setSexes(res || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "โหลดรายการเพศไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { sexes, loading, error };
}
