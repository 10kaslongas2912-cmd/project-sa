// src/services/https.ts
import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8000";

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    return AccessToken ? AccessToken : null;
  }
  return null;
};

// ✅ แก้: อ่านจาก sessionStorage ก่อน แล้วค่อย fallback
const getToken = (): string | null => {
  return (
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    getCookie("0195f494-feaa-734a-92a6-05739101ede9") ||
    null
  );
};

// ✅ แก้: token_type ก็อ่านจาก sessionStorage ก่อน
const getTokenType = (): string =>
  sessionStorage.getItem("token_type") ||
  localStorage.getItem("token_type") ||
  "Bearer";

const getConfig = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `${getTokenType()} ${token}`;
  return { headers };
};

const getConfigWithoutAuth = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

export const Post = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .post(`${API_URL}${url}`, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        // ✅ แก้: เคลียร์ทั้ง sessionStorage และ localStorage
        try { sessionStorage.clear(); } catch {}
        try { localStorage.clear(); } catch {}
        window.location.reload();
      }
      return error.response;
    });
};

export const Get = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .get(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.message === "Network Error") {
        return error.response;
      }
      if (error?.response?.status === 401) {
        // ✅ แก้: เคลียร์ทั้ง sessionStorage และ localStorage
        try { sessionStorage.clear(); } catch {}
        try { localStorage.clear(); } catch {}
        window.location.reload();
      }
      return error.response;
    });
};

export const Put = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .put(`${API_URL}${url}`, data, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        // ✅ แก้: เคลียร์ทั้ง sessionStorage และ localStorage
        try { sessionStorage.clear(); } catch {}
        try { localStorage.clear(); } catch {}
        window.location.reload();
      }
      return error.response;
    });
};

export const Delete = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .delete(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        // ✅ แก้: เคลียร์ทั้ง sessionStorage และ localStorage
        try { sessionStorage.clear(); } catch {}
        try { localStorage.clear(); } catch {}
        window.location.reload();
      }
      return error.response;
    });
};

export const axiosInstance = axios.create({
  baseURL: API_URL,
});
