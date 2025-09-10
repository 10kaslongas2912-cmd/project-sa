// services/api/index.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// service/api/index.ts
import { Get, Post, Put, Delete } from "./https";
import { axiosInstance } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type {
  LoginUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/User";
import type { CreateDonationRequest } from "../interfaces/Donation";
import type { UpdateZCManagementRequest, ZcManagementInterface } from "../interfaces/ZcManagement";
import type { CreateVolunteerPayload } from "../interfaces/Volunteer";
import type { SkillInterface } from "../interfaces/Skill";

/** ---------- helpers ---------- */
const isFormData = (v: any): v is FormData =>
  typeof FormData !== "undefined" && v instanceof FormData;

const mpHeaders = { "Content-Type": "multipart/form-data" };
import type { CreateAdoptionRequest, UpdateStatusRequest } from "../interfaces/Adoption";
import type { CreateSponsorshipRequest } from "../interfaces/Sponsorship";

/** ---------- AUTH ---------- */
export const authAPI = {
  logIn: (data: LoginUserRequest) =>
    Post("/users/auth", data, false),     // ตาม BE ปัจจุบันของคุณ
  signUp: (data: CreateUserRequest) =>
    Post("/users/signup", data, false),

  // ถ้า BE ใช้ /auth/me ให้เปลี่ยน path ตรงนี้ที่เดียว
  me: () => Get("/users/me"),

  // ถ้า BE ไม่มี endpoint นี้ ลบออกได้
  logout: () => Post("/user/logout", {}),
};

// ฐานพหูพจน์ + /:id
export const userAPI = {
  getAll:  () => Get("/users"),
  getById: (id: number) => Get(`/users/${id}`),
  update:  (id: number, data: UpdateUserRequest) => Put(`/users/${id}`, data),
  remove:  (id: number) => Delete(`/users/${id}`),
};

/** ---------- ADOPTERS (CRUD) ---------- */
export const adopterAPI = {
    create: (data: CreateAdoptionRequest) => Post("/adoptions", data),
    getAll: () => Get("/adoptions"),
    updateStatus: (id: number, data: UpdateStatusRequest) => Put(`/adoptions/${id}/status`, data), 
    remove: (id: number) => Delete(`/adoptions/${id}`),
    getMyCurrentAdoptions: () => Get("/my-adoptions", true), 
};


/** ---------- DOGS (CRUD) ---------- */
// แก้ให้สม่ำเสมอทุกเมธอดอยู่ใต้ /dogs
export const dogAPI = {
  getAll:  () => Get("/dogs"),
  getById: (id: number) => Get(`/dogs/${id}`),
  create:  (data: CreateDogRequest) => Post("/dogs", data),
  update:  (id: number, data: UpdateDogRequest) => Put(`/dogs/${id}`, data),
  remove:  (id: number) => Delete(`/dogs/${id}`),
};

/** ---------- LOOKUPS ---------- */
export const genderAPI = {
  getAll:  () => Get("/genders"),
  getById: (id: number) => Get(`/genders/${id}`),
};

export const breedAPI = {
  getAll:  () => Get("/breeds"),
  getById: (id: number) => Get(`/breeds/${id}`),
};

export const animalSexAPI = {
  getAll:  () => Get("/animal-sexes"),        // ← ทางที่แนะนำ
  getById: (id: number) => Get(`/animal-sexes/${id}`),

  // --- ถ้าต้องรองรับของเก่า ชั่วคราวใช้แบบนี้ ---
  // getAll:  () => Get("/animal-sexs"),
  // getById: (id: number) => Get(`/animal-sex/${id}`),
};

export const roleAPI = {
  getAll:  () => Get("/roles"),
  getById: (id: number) => Get(`/roles/${id}`),
};

export const paymentMethodAPI = {
  getAll: () => Get("/paymentMethods"),
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



export const donationAPI = {
  getAll:  () => Get("/donations"),
  getById: (id: number) => Get(`/donations/${id}`),
  getMyDonations: () => Get("/donations/my"), // สำหรับดึงการบริจาคของผู้ใช้ที่ล็อกอิน
  create:  (data: CreateDonationRequest) => Post("/donations", data),
  // update:  (id: number, data: UpdateDonationRequest) => Put(`/donations/${id}`, data),
  // remove:  (id: number) => Delete(`/donations/${id}`),
};


export const sponsorshipAPI = {
  getAll:  () => Get("/sponsorships"),
  getById: (id: number) => Get(`/sponsorships/${id}`),
  createSubscription:  (data: CreateSponsorshipRequest) => Post("/sponsorships/subscription", data),
  createOneTime:  (data: CreateSponsorshipRequest) => Post("/sponsorships/one-time", data),
}
// รวม export เดียว
export const healthRecordAPI = {
  searchDogs: (query: string) => Get(`/dogs?name=${query}`),
  getHealthRecordsByDogId: (dogId: string) => Get(`/health-records/dog/${dogId}`),
  getHealthRecordById: (recordId: number) => Get(`/health-records/${recordId}`),
  createHealthRecord: (data: any) => Post(`/health-records`, data),
  updateHealthRecord: (recordId: number, data: any) => Put(`/health-records/${recordId}`, data),
  deleteHealthRecord: (recordId: number) => Delete(`/health-records/${recordId}`),
};
export const vaccineAPI = {
  getAll:  () => Get("/vaccines"),
  getById: (id: number) => Get(`/vaccines/${id}`),
};
export const visitAPI = {
  createVisit: (data: any) => Post("/visits", data),
};

export const personalityAPI = {
  getAll: () => Get("/personalities"),
}


let _KENNEL_00_ID: number | null = null;

const resolveKennel00Id = async (): Promise<number> => {
  if (_KENNEL_00_ID !== null) return _KENNEL_00_ID;

  const res: any = await Get("/zcmanagement");
  const payload = (res && "data" in res) ? (res as any).data : res;
  const ks: any[] = Array.isArray(payload?.kennels) ? payload.kennels : [];

  const k00 = ks.find(k => String(k?.name ?? "").trim() === "00");
  const id = Number(k00?.id ?? k00?.ID ?? 0) || 0;
  _KENNEL_00_ID = id;  // cache
  return id;
};

export const zcManagementAPI = {
  getAll: () => Get("/zcmanagement"),
  getZones: () => Get("/zones"),
  getKennelsByZone: (zoneId: number) => Get(`/kennels/${Number(zoneId)}`),

  // List dogs in a kennel
  getDogsInKennel: (kennelId: number) =>
    Get(`/dogs?kennel_id=${Number(kennelId)}`),

  // Assign: set dog's kennel_id = kennelId
  assignDogToKennel: (kennelId: number, dogId: number) =>
    dogAPI.update(Number(dogId), { kennel_id: Number(kennelId) } as UpdateDogRequest),

  // "Unassign": move dog into kennel named "00"
  removeDogFromKennel: async (_kennelId: number, dogId: number) => {
    const k00 = await resolveKennel00Id();
    if (!k00) throw new Error('Kennel "00" not found. Seed it first.');
    return dogAPI.update(Number(dogId), { kennel_id: k00 } as UpdateDogRequest);
  },

  // Optional helper if you need the id elsewhere (e.g. to list "uncaged" dogs)
  getUnassignedKennelId: () => resolveKennel00Id(),
};


export const api = {
  authAPI,
  userAPI,
  dogAPI,
  genderAPI,
  breedAPI,
  animalSexAPI,
  roleAPI,
  adopterAPI,
  paymentMethodAPI,
  donationAPI,
  zcManagementAPI,
  volunteerAPI,
  skillsAPI,
  sponsorshipAPI,
  healthRecordAPI,
  vaccineAPI,
  visitAPI,
};
