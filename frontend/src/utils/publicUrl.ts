// src/utils/publicUrl.ts
export const publicUrl = (p?: string) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const base = import.meta.env.VITE_API_KEY || "http://localhost:8000";
  return `${base}${p}`;
};
