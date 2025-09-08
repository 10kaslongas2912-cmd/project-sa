// service/api/index.ts
import { Get, Post, Put, Delete } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type {
  LoginUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/User";
import type { CreateDonationRequest } from "../interfaces/Donation";
import type { UpdateZCManagementRequest } from "../interfaces/ZcManagement";
import axios from "axios";
import type { CreateVolunteerPayload } from "../interfaces/Volunteer";
/** ---------- AUTH ---------- */
// หมายเหตุ: login/signup ไม่ต้องแนบ token -> ส่ง false ให้ wrapper
// me/logout แนบ token (default ของ wrapper = แนบให้)
export const authAPI = {
  logIn: (data: LoginUserRequest) =>
    Post("/user/auth", data, false),     // ตาม BE ปัจจุบันของคุณ
  signUp: (data: CreateUserRequest) =>
    Post("/user/signup", data, false),

  // ถ้า BE ใช้ /auth/me ให้เปลี่ยน path ตรงนี้ที่เดียว
  me: () => Get("/user/me"),

  // ถ้า BE ไม่มี endpoint นี้ ลบออกได้
  logout: () => Post("/user/logout", {}),
};

/** ---------- USERS (CRUD) ---------- */
// ฐานพหูพจน์ + /:id
export const userAPI = {
  getAll:  () => Get("/users"),
  getById: (id: number) => Get(`/user/${id}`),
  update:  (id: number, data: UpdateUserRequest) => Put(`/user/${id}`, data),
  remove:  (id: number) => Delete(`/user/${id}`),
};

/** ---------- DOGS (CRUD) ---------- */
// แก้ให้สม่ำเสมอทุกเมธอดอยู่ใต้ /dogs
export const dogAPI = {
  getAll:  () => Get("/dogs"),
  getById: (id: number) => Get(`/dog/${id}`),
  create:  (data: CreateDogRequest) => Post("/dog", data),
  update:  (id: number, data: UpdateDogRequest) => Put(`/dog/${id}`, data),
  remove:  (id: number) => Delete(`/dog/${id}`),
};

/** ---------- LOOKUPS ---------- */
// แนะนำให้ใช้พหูพจน์เป็นฐาน และ /:id สำหรับตัวเดียว
export const genderAPI = {
  getAll:  () => Get("/genders"),
  getById: (id: number) => Get(`/gender/${id}`),
};

export const breedAPI = {
  getAll:  () => Get("/breeds"),
  getById: (id: number) => Get(`/breed/${id}`),
};

// คำว่า sexes ปกติสะกดเป็น "animal-sexes"
// ถ้า BE ปัจจุบันของคุณใช้ "animal-sexs" อยู่ ให้คงตามนั้น หรือตั้ง alias ไว้ช่วงเปลี่ยนผ่าน
export const animalSexAPI = {
  getAll:  () => Get("/animal-sexes"),        // ← ทางที่แนะนำ
  getById: (id: number) => Get(`/animal-sex/${id}`),

  // --- ถ้าต้องรองรับของเก่า ชั่วคราวใช้แบบนี้ ---
  // getAll:  () => Get("/animal-sexs"),
  // getById: (id: number) => Get(`/animal-sex/${id}`),
};

export const roleAPI = {
  getAll:  () => Get("/roles"),
  getById: (id: number) => Get(`/role/${id}`),
};


export const paymentMethodAPI = {
  getAll: () => Get("/paymentMethods"),
}


export const donationAPI = {
  getAll:  () => Get("/donations"),
  getById: (id: number) => Get(`/donation/${id}`),
  create:  (data: CreateDonationRequest) => Post("/donations", data),
  // update:  (id: number, data: UpdateDogRequest) => Put(`/dog/${id}`, data),
  // remove:  (id: number) => Delete(`/dog/${id}`),
};

export const zcManagementAPI = {
  getAll: () => Get("/zcmanagement"),
  update: (id: number, data: UpdateZCManagementRequest) => Put(`/zcmanagement/${id}`, data),
};

export const volunteerAPI = {
  getAll: () => Get("/volunteers"),
  getById: (id: number) => Get(`/volunteer/${id}`),

  create: (data: FormData | CreateVolunteerPayload) => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      // use axios directly for multipart
      return axios.post("/volunteer", data); // or axiosInstance.post(...)
    }
    return Post("/volunteer", data);
  },

  update: (id: number, data: FormData | CreateVolunteerPayload) => {
    if (typeof FormData !== "undefined" && data instanceof FormData) {
      return axios.put(`/volunteer/${id}`, data); // or axiosInstance.put(...)
    }
    return Put(`/volunteer/${id}`, data);
  },

  remove: (id: number) => Delete(`/volunteer/${id}`),
};

// รวม export เดียว
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
};
