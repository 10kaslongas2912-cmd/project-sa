package entity

import (
	"gorm.io/gorm"
)

type Staff struct {
	gorm.Model
	Username string `json:"username"`
	Password string `json:"-"` // เพิ่ม Password field และใช้ `json:"-"` เพื่อไม่ให้แสดงใน JSON response
	Firstname string `json:"firstname"`
	Lastname string	`json:"lastname"`
	Email    string `json:"email"`    // เพิ่ม Email
	Phone string `json:"phone"`
	DateOfBirth string `json:"date_of_birth"`
	Note *string `json:"note"`
	RoleID uint  `json:"role_id"`
	Role   *Role `gorm:"foreignKey:RoleID"`
	Status *string `json:"status"`
	ZoneID uint  `json:"zone_id"`
	Zone   *Zone `gorm:"foreignKey:ZoneID"`

	GenderID uint `json:"gender_id"`
	Gender *Gender `gorm:"foreignKey:GenderID"`

	KenelManagements []KenelManagement `gorm:"foreignKey:StaffID"`
	Events           []Event           `gorm:"foreignKey:StaffID"`
	MedicalRecords   []MedicalRecord   `gorm:"foreignKey:StaffID"`
}