package entity

import (
	"gorm.io/gorm"
)

type Staff struct {
	gorm.Model
	Username string `json:"username"`
	Password string `json:"-"` // เพิ่ม Password field และใช้ `json:"-"` เพื่อไม่ให้แสดงใน JSON response
	FirstName string `json:"first_name"`
	LastName string	`json:"last_name"`
	Email    string `json:"email"`    // เพิ่ม Email
	Phone string `json:"phone"`
	DateOfBirth string `json:"date_of_birth"`
	PhotoURL *string `json:"photo_url"`
	Note *string `json:"note"`
	Status *string `json:"status"`
	ZoneID uint  `json:"zone_id"`
	Zone   *Zone `gorm:"foreignKey:ZoneID" json:"zone"`

	GenderID uint `json:"gender_id"`
	Gender *Gender `gorm:"foreignKey:GenderID" json:"gender"`

	KennelManagements []KennelManagement `gorm:"foreignKey:StaffID" json:"kennel_managements"`
	MedicalRecords   []MedicalRecord   `gorm:"foreignKey:StaffID" json:"medical_records"`
}
