const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8000";
export function publicUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
}