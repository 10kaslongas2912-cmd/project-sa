// service/api/index.ts
import { Get, Post, Put, Delete } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type {
  LoginUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "../interfaces/User";
import type { CreateDonationRequest } from "../interfaces/Donation";

/** ---------- AUTH ---------- */
// หมายเหตุ: login/signup ไม่ต้องแนบ token -> ส่ง false ให้ wrapper
// me/logout แนบ token (default ของ wrapper = แนบให้)
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
// แนะนำให้ใช้พหูพจน์เป็นฐาน และ /:id สำหรับตัวเดียว
export const genderAPI = {
  getAll:  () => Get("/genders"),
  getById: (id: number) => Get(`/genders/${id}`),
};

export const breedAPI = {
  getAll:  () => Get("/breeds"),
  getById: (id: number) => Get(`/breeds/${id}`),
};

// คำว่า sexes ปกติสะกดเป็น "animal-sexes"
// ถ้า BE ปัจจุบันของคุณใช้ "animal-sexs" อยู่ ให้คงตามนั้น หรือตั้ง alias ไว้ช่วงเปลี่ยนผ่าน
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
}


export const donationAPI = {
  getAll:  () => Get("/donations"),
  getById: (id: number) => Get(`/donation/${id}`),
  create:  (data: CreateDonationRequest) => Post("/donations", data),
  // update:  (id: number, data: UpdateDogRequest) => Put(`/dog/${id}`, data),
  // remove:  (id: number) => Delete(`/dog/${id}`),
};
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
  healthRecordAPI,
  vaccineAPI
};
