import type { DogInterface } from "./Dog";

// พิมพ์เขียวสำหรับข้อมูลสุนัข (พื้นฐาน) ที่จะแสดงในหน้า Admin
export interface DogBasicInfo {
    ID:   number;
    name: string;
}

// พิมพ์เขียวสำหรับข้อมูลผู้ใช้ (พื้นฐาน) ที่จะแสดงในหน้า Admin
export interface UserBasicInfo {
    ID:       number;
    username: string;
}

// พิมพ์เขียวสำหรับข้อมูลคำขอรับเลี้ยงฉบับเต็มที่จะแสดงในหน้า Admin
// มาจากฟังก์ชัน GetAllAdoptions ที่มีการ Preload("Dog") และ Preload("User")
export interface AdoptionWithDetails {
    ID:           number;
    first_name:   string;
    last_name:    string;
    phone_number: string;
    address:      string;
    district:     string;
    city:         string;
    province:     string;
    zip_code:     string;
    job:          string;
    income:       number;
    status:       'pending' | 'approved' | 'rejected';
    dog:          DogBasicInfo | null;
    user:         UserBasicInfo | null;
    CreatedAt:    string; // GORM จะส่งค่าเวลามาเป็น string ในรูปแบบ ISO 8601
    UpdatedAt: string;
}

// พิมพ์เขียวสำหรับข้อมูลที่จะส่งไป "สร้าง" คำขอรับเลี้ยงใหม่
// โครงสร้างนี้ต้องตรงกับ CreateAdoptionRequest DTO ในไฟล์ handler ของ Go
export interface CreateAdoptionRequest {
    first_name:   string;
    last_name:    string;
    phone_number: string;
    address:      string;
    district:     string;
    city:         string;
    province:     string;
    zip_code:     string;
    job:          string;
    income?:      number; // Optional เพราะใน Go เป็น float64 ที่อาจเป็น 0
    dog_id:       number;
    user_id?:     number | null; // Optional เพราะใน Go เป็น pointer (*uint)
}

// พิมพ์เขียวสำหรับข้อมูลที่จะส่งไป "อัปเดตสถานะ"
// โครงสร้างนี้ต้องตรงกับ UpdateStatusRequest DTO ในไฟล์ handler ของ Go
export interface UpdateStatusRequest {
    status: 'approved' | 'rejected';
}

export interface MyCurrentAdoption {
    ID:        number;
    dog:       DogInterface | null; // <-- ข้อมูล Dog จะซ้อนเข้ามาในนี้
    CreatedAt: string;
}