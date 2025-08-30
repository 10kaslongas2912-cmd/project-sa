import type { GenderInterface } from "./Gender";

export interface UserInterface {
  ID: number;
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
}

export interface UpdateUserRequest {
  username?: string;
  password?: string; 
  firstname?: string;
  lastname?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  gender_id?: number | null;
}
