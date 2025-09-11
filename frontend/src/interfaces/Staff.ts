import type { ZoneInterface } from "./Zone";
import type { GenderInterface } from "./Gender";
export interface AppStaffInterface {
  ID: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  photo_url: string;
  note?: string | null;
  status?: string | null;
  gender?: GenderInterface; // ถ้ามี interface Gender อยู่แล้ว เปลี่ยนเป็น Gender
  zone?: ZoneInterface;   // ถ้ามี interface Zone อยู่แล้ว เปลี่ยนเป็น Zone
}   


export interface LoginStaffRequest {
  username?: string; 
  email?: string;
  password: string;
}

