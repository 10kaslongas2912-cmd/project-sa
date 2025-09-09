// services/api/index.ts
import { Get, Post, Put, Delete } from "./https";
import { axiosInstance } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type {
  LoginUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/User";
import type { CreateDonationRequest } from "../interfaces/Donation";
import type { UpdateZCManagementRequest } from "../interfaces/ZcManagement";
import type { CreateVolunteerPayload } from "../interfaces/Volunteer";
import type { SkillInterface } from "../interfaces/Skill";

/** ---------- helpers ---------- */
const isFormData = (v: any): v is FormData =>
  typeof FormData !== "undefined" && v instanceof FormData;

const mpHeaders = { "Content-Type": "multipart/form-data" };

/** ---------- AUTH ---------- */
export const authAPI = {
  logIn: (data: LoginUserRequest) => Post("/user/auth", data, false),
  signUp: (data: CreateUserRequest) => Post("/user/signup", data, false),
  me: () => Get("/user/me"),
  logout: () => Post("/user/logout", {}),
};

/** ---------- USERS ---------- */
export const userAPI = {
  getAll: () => Get("/users"),
  getById: (id: number) => Get(`/user/${id}`),
  update: (id: number, data: UpdateUserRequest) => Put(`/user/${id}`, data),
  remove: (id: number) => Delete(`/user/${id}`),
};

/** ---------- DOGS ---------- */
export const dogAPI = {
  getAll: () => Get("/dogs"),
  getById: (id: number) => Get(`/dogs/${id}`),
  create: (data: CreateDogRequest) => Post("/dogs", data),
  update: (id: number, data: UpdateDogRequest) => Put(`/dogs/${id}`, data),
  remove: (id: number) => Delete(`/dogs/${id}`),
};

/** ---------- LOOKUPS ---------- */
export const genderAPI = {
  getAll: () => Get("/genders"),
  getById: (id: number) => Get(`/gender/${id}`),
};

export const breedAPI = {
  getAll: () => Get("/breeds"),
  getById: (id: number) => Get(`/breed/${id}`),
};

export const animalSexAPI = {
  getAll: () => Get("/animal-sexes"),
  getById: (id: number) => Get(`/animal-sex/${id}`),
};

export const roleAPI = {
  getAll: () => Get("/roles"),
  getById: (id: number) => Get(`/role/${id}`),
};

export const paymentMethodAPI = {
  getAll: () => Get("/paymentMethods"),
};

/** ---------- DONATIONS ---------- */
export const donationAPI = {
  getAll: () => Get("/donations"),
  getById: (id: number) => Get(`/donation/${id}`),
  create: (data: CreateDonationRequest) => Post("/donations", data),
};

/** ---------- ZC MANAGEMENT ---------- */
export const zcManagementAPI = {
  getAll: () => Get("/zcmanagement"),
  update: (id: number, data: UpdateZCManagementRequest) =>
    Put(`/zcmanagement/${id}`, data),
};

/** ---------- VOLUNTEERS ---------- */
type StatusKind = "none" | "pending" | "approved" | "rejected" | "unknown";

export const volunteerAPI = {
  getAll: () => Get("/volunteers"),
  getById: (id: number) => Get(`/volunteer/${id}`),
  getByUser: (userId: number) => Get(`/volunteers/user/${userId}`),

  // NEW: derive user's latest status from BE response
  getStatusByUser: async (
    userId: number
  ): Promise<{ status: StatusKind; latest?: any }> => {
    try {
      const res = await axiosInstance.get(`/volunteers/user/${userId}`);
      const raw = res?.data?.data ?? res?.data ?? res;
      const arr: any[] = Array.isArray(raw) ? raw : [];
      if (arr.length === 0) return { status: "none" };

      // pick latest (by created_at fallback to id)
      const latest = [...arr].sort((a, b) => {
        const ta = new Date(a.created_at ?? a.CreatedAt ?? 0).getTime();
        const tb = new Date(b.created_at ?? b.CreatedAt ?? 0).getTime();
        if (ta && tb) return tb - ta;
        return Number(b.id ?? b.ID ?? 0) - Number(a.id ?? a.ID ?? 0);
      })[0];

      const rawStatus =
        latest?.status_fv?.status ??
        latest?.StatusFV?.Status ??
        latest?.status ??
        "";

      const s = String(rawStatus).toLowerCase();
      if (s === "pending" || s === "approved" || s === "rejected") {
        return { status: s as StatusKind, latest };
      }
      return { status: "unknown", latest };
    } catch (err) {
      console.error("GET /volunteers/user/:id failed:", err);
      return { status: "unknown" };
    }
  },

  create: (data: FormData | CreateVolunteerPayload) =>
    isFormData(data)
      ? axiosInstance.post("/volunteer", data, { headers: mpHeaders })
      : Post("/volunteer", data),

  update: (id: number, data: FormData | CreateVolunteerPayload) =>
    isFormData(data)
      ? axiosInstance.put(`/volunteer/${id}`, data, { headers: mpHeaders })
      : Put(`/volunteer/${id}`, data),

  remove: (id: number) => Delete(`/volunteer/${id}`),
};

/** ---------- SKILLS ---------- */
// BE returns { data: [ { ID, Description }, ... ] } (or sometimes just [])
export const skillsAPI = {
  getAll: async (): Promise<SkillInterface[]> => {
    try {
      const res = await axiosInstance.get("/skills");
      const raw = res?.data?.data ?? res?.data ?? res;
      const arr = Array.isArray(raw) ? raw : [];
      return arr.map((s: any) => ({
        id: Number(s.id ?? s.ID ?? 0),
        description: String(s.description ?? s.Description ?? "").trim(),
      }));
    } catch (err: any) {
      console.error("GET /skills failed:", err?.response?.data ?? err);
      throw err;
    }
  },
};

export const api = {
  authAPI,
  userAPI,
  dogAPI,
  genderAPI,
  breedAPI,
  animalSexAPI,
  roleAPI,
  paymentMethodAPI,
  donationAPI,
  zcManagementAPI,
  volunteerAPI,
  skillsAPI,
};
