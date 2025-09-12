import type { GenderInterface } from "./Gender";

export interface UserInterface {
  ID: number;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  photo_url: string;
  gender_id: number;
  gender?: GenderInterface;
  
}

export interface AppUserInterface {
  ID: number;
  name: string | null;
  first_name: string;
  last_name: string;
  photo_url?: string;
  email: string;
  phone: string;
  gender_id: number;
  gender: GenderInterface;
}

export interface LoginUserRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  gender_id: number;
  photo_url?: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string; 
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  gender_id?: number | null;
}