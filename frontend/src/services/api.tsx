import { Get, Post, Put, Delete } from "./https";
import type { CreateDogRequest, UpdateDogRequest } from "../interfaces/Dog";
import type { LoginUserRequest, CreateUserRequest, UpdateUserRequest } from "../interfaces/User";
// auth
export const authAPI = {
  logIn: (data: LoginUserRequest) =>
    Post("/user/auth", data, false),
  signUp: (data: CreateUserRequest) =>
    Post("/user/signup", data, false),
};

// users
export const userAPI = {
  getAll:  () => Get("/users"),
  getById: (id: number) => Get(`/user/${id}`),
  update:  (id: number, data: UpdateUserRequest ) => Put(`/user/${id}`, data),
  remove:  (id: number) => Delete(`/user/${id}`),
};


export const dogAPI = {
//   getAll:  (filters?: DogFilters) => Get("/dogs", filters),
  getAll: () => Get("/dogs"),
  getById: (id: number) => Get(`/dogs/${id}`),
  create:  (data: CreateDogRequest) => Post("/dogs", data),
  update:  (id: number, data: UpdateDogRequest) => Put(`/dogs/${id}`, data),
  remove:  (id: number) => Delete(`/dogs/${id}`),
};

export const genderAPI = {
  getAll:  () => Get("/genders"),
  getById: (id: number) => Get(`/gender/${id}`),
}

export const breedAPI = {
    getAll: () => Get("/breeds"),
    getById: (id: number) => Get(`/breed/${id}`),    
}

export const animalSexAPI = {
    getAll: () => Get("/animal-sexs"),
    getById: (id: number) => Get(`/animal-sex/${id}`),  
}

export const roleAPI = {
    getAll: () => Get("/roles"),
    getById: (id: number) => Get(`/role/${id}`),  
}


// รวมเป็นก้อนเดียวถ้าชอบ import เดียว
export const api = { authAPI, userAPI, dogAPI, genderAPI, breedAPI, animalSexAPI, roleAPI };
