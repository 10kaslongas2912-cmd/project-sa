import type { RoleInterface } from "./Role";

export interface StaffInterface {
    ID: number;
    username: string;
    password?: string;
    first_name: string;
    last_name: string;
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