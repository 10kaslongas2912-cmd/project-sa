// src/hooks/useDogs.ts
import { useEffect, useState } from "react";
import { dogAPI } from "../services/apis";
import type { DogInterface } from "../interfaces/Dog";

export function useDogs() {
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const res = await dogAPI.getAll();
      console.log("dogAPI.getAll() raw response:", res);

      if (Array.isArray(res.data)) {
        setDogs(res.data);
      } else if (Array.isArray(res.data?.dogs)) {
        setDogs(res.data.dogs);
      } else {
        console.error("Unexpected dogs response:", res.data);
        setDogs([]);
      }
    } catch (e: any) {
      setError(e?.message || "โหลดข้อมูลน้องหมาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  return { dogs, loading, error };
}