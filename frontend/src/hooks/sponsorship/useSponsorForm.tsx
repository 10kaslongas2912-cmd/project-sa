// src/hooks/sponsorship/useSponsorForm.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GenderInterface } from "../../interfaces/Gender";

export type UpdatesYesNo = "no" | "yes";
export type UpdatesChannel = "email" | "sms" | "line";
export type UpdatesFreq = "weekly" | "biweekly" | "monthly" | "quarterly";
type TitleCode = "mr" | "mrs" | "ms";

export interface SponsorFormState {
  title: TitleCode | "";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  wantsUpdates: UpdatesYesNo;
  updateChannel: UpdatesChannel;
  updateFrequency: UpdatesFreq;
  gender_id?: number | null; // เก็บเป็น id เสมอ
}

const defaultState: SponsorFormState = {
  title: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  wantsUpdates: "no",
  updateChannel: "email",
  updateFrequency: "monthly",
  gender_id: null,
};

const KEY = (dogId?: number | null) => `sponsorform:${dogId ?? "unknown"}`;

export function clearSponsorFormPersisted(dogId: number | null) {
  try {
    sessionStorage.removeItem(KEY(dogId));
  } catch {}
}
const loadPersisted = (dogId: number | null): Partial<SponsorFormState> => {
  try { const raw = sessionStorage.getItem(KEY(dogId)); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};
const savePersisted = (dogId: number | null, state: SponsorFormState) => {
  try { sessionStorage.setItem(KEY(dogId), JSON.stringify(state)); } catch {}
};
const clearPersisted = (dogId: number | null) => {
  try { sessionStorage.removeItem(KEY(dogId)); } catch {}
};

// ---------- title↔gender rules ----------
const TITLE_BY_CODE: Record<"M" | "F" | "U", TitleCode[]> = {
  M: ["mr"],
  F: ["mrs", "ms"],
  U: ["mr", "mrs", "ms"], // unknown
};
const inferGenderCodeFromTitle = (title?: TitleCode | ""): "M" | "F" | "U" => {
  if (!title) return "U";
  if (title === "mr") return "M";
  if (title === "mrs" || title === "ms") return "F";
  return "U";
};

// ---------- helpers: map code ↔ id จาก BE ----------
const getGenderById = (genders: GenderInterface[], id?: number | null) =>
  genders.find(g => g.ID === id) || null;

const getGenderIdByCode = (genders: GenderInterface[], code?: string | null) => {
  if (!code) return null;
  const g = genders.find(x => (x.code || "").toUpperCase() === code.toUpperCase());
  return g?.ID ?? null;
};

export function useSponsorForm(dogId: number | null, genders: GenderInterface[] = []) {
  const [state, setState] = useState<SponsorFormState>({
    ...defaultState,
    ...loadPersisted(dogId),
  });

  // persist ทุกครั้งที่ state เปลี่ยน
  useEffect(() => { savePersisted(dogId, state); }, [dogId, state]);

  // allowed titles ตาม gender ที่เลือก
  const allowedTitles = useMemo<TitleCode[]>(() => {
    const g = getGenderById(genders, state.gender_id);
    const code = (g?.code || "U") as "M" | "F" | "U";
    return [...TITLE_BY_CODE[code]];
  }, [genders, state.gender_id]);

  // set field เดี่ยว
  const setField = useCallback(
    <K extends keyof SponsorFormState>(key: K, value: SponsorFormState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    []
  );

  // ฟังก์ชันเฉพาะ: set gender แล้วกรอง title ให้ถูกต้อง
  const setGenderId = useCallback((gid: number | null) => {
    setState((s) => {
      const next = { ...s, gender_id: gid };
      // ถ้า title ปัจจุบันไม่อยู่ใน allowed ⇒ เคลียร์
      const allowed = (() => {
        const g = getGenderById(genders, gid);
        const code = (g?.code || "U") as "M" | "F" | "U";
        return TITLE_BY_CODE[code];
      })();
      if (next.title && !allowed.includes(next.title)) {
        next.title = "";
      }
      return next;
    });
  }, [genders]);

  // ฟังก์ชันเฉพาะ: set title แล้วเดา gender ให้อัตโนมัติ (ถ้า map ได้)
  const setTitleWithSync = useCallback((title: TitleCode | "") => {
    setState((s) => {
      const next = { ...s, title };
      const inferredCode = inferGenderCodeFromTitle(title);
      if (inferredCode !== "U") {
        const gid = getGenderIdByCode(genders, inferredCode);
        if (gid) next.gender_id = gid;
      }
      return next;
    });
  }, [genders]);

  // set หลายฟิลด์
  const setMany = useCallback((patch: Partial<SponsorFormState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...defaultState });
    clearPersisted(dogId);
  }, [dogId]);

  // เติมค่าเมื่อมี user (จาก useAuthUser)
  type UserLike = {
    title?: TitleCode | "" | null;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    gender_id?: number | null;
    gender?: { ID?: number | null; code?: string | null } | null;
  };
  const prefillFromUser = useCallback((user?: UserLike | null) => {
    if (!user) return;
    setState((s) => {
      const next = { ...s };

      // identity fields — เติมเฉพาะที่ว่าง
      if (!next.first_name?.trim()) next.first_name = user.first_name ?? user.name ?? "";
      if (!next.last_name?.trim())  next.last_name  = user.last_name ?? "";
      if (!next.email?.trim())      next.email      = user.email ?? "";
      if (!next.phone?.trim())      next.phone      = user.phone ?? "";

      // gender id จาก user → ใช้ตรง ๆ ก่อน
      let gid: number | null | undefined = user.gender_id ?? user.gender?.ID ?? null;
      // ถ้ายังไม่มี แต่มี code เช่น "M"/"F" → map เป็น id จาก genders
      if (!gid && user.gender?.code) {
        gid = getGenderIdByCode(genders, user.gender.code);
      }
      if (!next.gender_id && gid) next.gender_id = gid;

      // title: เติมเฉพาะตอนยังว่าง
      if (!next.title && user.title) {
        next.title = user.title as TitleCode | "";
      }
      // ถ้า title ที่มีอยู่ ไม่เข้ากับ gender_id ที่เพิ่งได้มา → เคลียร์ title
      if (next.gender_id) {
        const allowedNow = (() => {
          const g = getGenderById(genders, next.gender_id);
          const code = (g?.code || "U") as "M" | "F" | "U";
          return TITLE_BY_CODE[code];
        })();
        if (next.title && !allowedNow.includes(next.title)) {
          next.title = "";
        }
      }

      return next;
    });
  }, [genders]);

  // ตรวจความครบของฟอร์ม (ขั้นต่ำ)
  const validate = useCallback((): string | null => {
    if (!state.first_name.trim() || !state.last_name.trim() || !state.email.trim() || !state.phone.trim()) {
      return "กรุณากรอกชื่อ นามสกุล อีเมล และเบอร์โทร";
    }
    return null;
  }, [state]);

  // payload
  const sponsorData = useMemo(() => ({
    title: state.title || null,
    first_name: state.first_name.trim(),
    last_name: state.last_name.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    gender_id: state.gender_id ?? null,
  }), [state]);

  const updatesPreference = useMemo(() => ({
    enabled: state.wantsUpdates === "yes",
    channel: state.wantsUpdates === "yes" ? state.updateChannel : null,
    frequency: state.wantsUpdates === "yes" ? state.updateFrequency : null,
  }), [state.wantsUpdates, state.updateChannel, state.updateFrequency]);

  return {
    state,
    allowedTitles,     // << ใช้ไปกรอง options ในหน้า form
    setField,
    setMany,
    setGenderId,
    setTitleWithSync,
    reset,
    prefillFromUser,
    validate,
    sponsorData,
    updatesPreference,
  };
}
