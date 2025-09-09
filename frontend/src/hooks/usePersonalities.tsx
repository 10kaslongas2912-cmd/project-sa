// src/hooks/usePersonalities.ts
import { useEffect, useState } from "react";
import { personalityAPI } from "../services/apis";

import type { PersonalityInterface } from "../interfaces/Personality";

export function usePersonalities() {
  const [personalities, setPersonalities] = useState<PersonalityInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await personalityAPI.getAll(); // ควรคืน PersonalityInterface[]
        setPersonalities(res);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "โหลดข้อมูลบุคลิกไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { personalities, loading, error };
}
