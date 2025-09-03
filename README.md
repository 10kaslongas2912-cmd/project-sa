# 📘 Project Naming & API Field Guide

> ฉบับเดียวจบ: กติกาการตั้งชื่อทั้ง **Frontend (TS/React)** และ **Backend (Go/GORM)**  
> ✅ เวอร์ชันนี้ **ใช้ `gorm.Model`** ฝั่ง BE ดังนั้นคีย์มาตรฐานจะออก JSON เป็น **ตัวใหญ่**: `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`  
> ✅ ฝั่ง FE ให้ประกาศ interface ให้ **ตรง JSON จริง** (ใช้ `ID` ตัวใหญ่ ฯลฯ)

---

## TL;DR

- **FE (TS/React)**  
  - **โค้ดทั่วไป**: `camelCase` → `firstName`, `userId`, `isLoading`  
  - **ชื่อ Type / Interface / Component**: `PascalCase` → `User`, `CreateDonationRequest` , `UpdateUserRequest`, `DeleteDogRequest`
  - **API interfaces**: ให้ **สะท้อน JSON จริง**  
    - ใช้ `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt` (ตัวใหญ่) เพราะมาจาก `gorm.Model`
    - ฟิลด์อื่น ๆ ที่มาจากแท็ก `json:"..."` ของ BE ให้ใช้ `snake_case` ตามที่ส่งมา เช่น `first_name`, `user_id`

- **BE (Go/GORM)**  
  - ชื่อ `struct` และฟิลด์ (export): `PascalCase` → `FirstName`, `Username`, `UserID`  
  - Initialisms พิมพ์ใหญ่ทั้งก้อน: `ID`, `URL`, `HTTP` → `UserID`, `PhotoURL`  
  - **คีย์ JSON**:
    - ฟิลด์จาก `gorm.Model` → **`ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`** (ตัวใหญ่ ไม่มี `json` tag)
    - ฟิลด์อื่นใส่แท็ก `json:"snake_case"` → เช่น `first_name`, `user_id`
  - **คำพิเศษ**: `Username`, `Password` ถือเป็น **คำเดียว**  
    - JSON/DB: `username`, `password_hash` (ไม่ใช่ `user_name`, `pass_word`)

---

## Backend (Go) — ตัวอย่าง Entity (ใช้ `gorm.Model`)

```go
type User struct {
    gorm.Model // => ส่ง JSON: ID, CreatedAt, UpdatedAt, DeletedAt (ย้ำ!! ID ตัวใหญ่)

    FirstName    string  `json:"first_name"
    LastName     string  `json:"last_name"
    Username     string  `json:"username"      gorm:"uniqueIndex"` /* ให้มองเป็น Username✅ เพราะถือว่าคำเดียว
                                                                      ไม่ใช่ UserName❌ เช่นเดียวกับ
                                                                      Password✅ ไม่ใช่ PassWord❌ */
    Password     string  `json:"-"             
    Email        string  `json:"email"         gorm:"uniqueIndex"`
    Phone        string  `json:"phone"         
}
