import type { RoleInterface } from "./Role";

export interface StaffInterface {
    id: number;
    username: string;
    password?: string;
    firstname: string;
    lastname: string;
    date_of_birth: string;
    phone: string;
    email: string;
    role_id: number;
    role: RoleInterface;
        
}


export interface LoginStaffRequest {
  username: string;
  password: string;
}