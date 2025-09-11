export type Actor = "user" | "staff";

type AuthPayload = {
  actor: Actor;
  token_type: string;
  token: string;
  id?: string | number | null;
};

const KEY = "auth";

export const authStore = {
  set(payload: AuthPayload) {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
    // เผื่อจุดเก่าๆ ยังอ่านคีย์เดิม
    if (payload.id != null) sessionStorage.setItem("ID", String(payload.id));
    sessionStorage.setItem("userType", payload.actor);
    sessionStorage.setItem("token_type", payload.token_type);
    sessionStorage.setItem("token", payload.token);
    sessionStorage.setItem("isLogin", "true");
  },
  get(): AuthPayload | null {
    const raw = sessionStorage.getItem(KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  clear() {
    sessionStorage.removeItem(KEY);
    ["isLogin","userType","token_type","token","ID"].forEach(k => sessionStorage.removeItem(k));
  },
};
