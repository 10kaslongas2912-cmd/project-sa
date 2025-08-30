// api/index.ts
import { Get, Post, Put, Delete } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type { LoginUserRequest, CreateUserRequest, UpdateUserRequest } from "../interfaces/User";

/** ---------- AUTH ---------- */
// หมายเหตุ:
// - login/signup ไม่ต้องแนบ token -> ส่ง false ให้ wrapper
// - me/logout ต้องแนบ token (ค่า default ของ wrapper = แนบให้)
export const authAPI = {
  logIn: (data: LoginUserRequest) =>
    Post("/user/auth", data, false),          // <- ตาม BE ปัจจุบันของคุณ
  signUp: (data: CreateUserRequest) =>
    Post("/user/signup", data, false),

  // แนะนำให้มี /auth/me ชัดเจน (หรือถ้า BE ใช้ /user/me ก็เปลี่ยนตรงนี้)
  me: () => Get("/user/me"),

  // ถ้ามี endpoint logout
  logout: () => Post("/user/logout", {}),
};

/** ---------- USERS (CRUD) ---------- */
// ทำ path ให้สม่ำเสมอ: พหูพจน์ + :id
export const userAPI = {
  getAll:  () => Get("/users"),
  getById: (id: number) => Get(`/users/${id}`),
  update:  (id: number, data: UpdateUserRequest ) => Put(`/users/${id}`, data),
  remove:  (id: number) => Delete(`/users/${id}`),
};

/** ---------- DOGS ---------- */
export const dogAPI = {
  getAll:  () => Get("/dogs"),
  getById: (id: number) => Get(`/dog/${id}`),
  create:  (data: CreateDogRequest) => Post("/dog", data),
  update:  (id: number, data: UpdateDogRequest) => Put(`/dog/${id}`, data),
  remove:  (id: number) => Delete(`/dog/${id}`),
};

/** ---------- LOOKUPS ---------- */
// ให้สม่ำเสมอ: พหูพจน์สำหรับ list, /:id สำหรับตัวเดียว
export const genderAPI = {
  getAll:  () => Get("/genders"),
  getById: (id: number) => Get(`/gender/${id}`),
};

export const breedAPI = {
  getAll:  () => Get("/breeds"),
  getById: (id: number) => Get(`/breed/${id}`),
};

export const animalSexAPI = {
  getAll:  () => Get("/animal-sexs"),
  getById: (id: number) => Get(`/animal-sex/${id}`),
};

export const roleAPI = {
  getAll:  () => Get("/roles"),
  getById: (id: number) => Get(`/role/${id}`),
};

// รวมเป็นก้อนเดียว ถ้าชอบ import เดียว
export const api = { authAPI, userAPI, dogAPI, genderAPI, breedAPI, animalSexAPI, roleAPI };
