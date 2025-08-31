import type { GenderInterface } from "./Gender";

export interface UserInterface {
  id: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  date_of_birth: string;
  email: string;
  phone: string;
  photo_url: string;
  gender_id: number;
  gender?: GenderInterface;
  
}

export interface AppUserInterface {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  photo_url?: string;
}

export interface LoginUserRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  date_of_birth: string;
  email: string;
  phone: string;
  gender_id: number;
  photo_url?: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string; 
  firstname?: string;
  lastname?: string;
  photo_url?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  gender_id?: number | null;
}
