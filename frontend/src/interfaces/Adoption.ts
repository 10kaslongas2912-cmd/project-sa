// พิมพ์เขียวสำหรับข้อมูลสุนัข (พื้นฐาน) ที่จะแสดงในตาราง
export interface DogBasicInfo {
    ID:   number;
    name: string;
}

// พิมพ์เขียวสำหรับข้อมูลผู้ใช้ (พื้นฐาน) ที่จะแสดงในตาราง
export interface UserBasicInfo {
    ID:       number;
    username: string;
}

// พิมพ์เขียวสำหรับข้อมูลคำขอรับเลี้ยงที่จะแสดงในตารางของหน้า Admin
// โครงสร้างนี้อิงตามข้อมูลที่ได้จากฟังก์ชัน GetAllAdoptions ใน Backend
export interface AdoptionWithDetails {
    ID:           number;
    first_name:   string;
    last_name:    string;
    phone_number: string;
    status:       'pending' | 'approved' | 'rejected';
    dog:          DogBasicInfo | null;
    user:         UserBasicInfo | null;
    CreatedAt:    string; // GORM จะส่งค่าวันที่มาเป็น string
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
    income?:      number; // Optional เพราะใน Go เป็น float64 ธรรมดา ไม่ใช่ pointer
    dog_id:       number;
    user_id?:     number | null; // Optional เพราะใน Go เป็น pointer (*uint)
}

// พิมพ์เขียวสำหรับข้อมูลที่จะส่งไป "อัปเดตสถานะ"
// โครงสร้างนี้ต้องตรงกับ UpdateAdoptionStatusRequest DTO ในไฟล์ handler ของ Go
export interface UpdateStatusRequest {
    status: 'approved' | 'rejected';
}