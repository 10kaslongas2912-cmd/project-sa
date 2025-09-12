package entity

import (
	"gorm.io/gorm"
)

type Staff struct {
	gorm.Model
	Username    string  `json:"username"`
	Password    string  `json:"-"` // เพิ่ม Password field และใช้ `json:"-"` เพื่อไม่ให้แสดงใน JSON response
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	Email       string  `json:"email"` // เพิ่ม Email
	Phone       string  `json:"phone"`
	DateOfBirth string  `json:"date_of_birth"`
	PhotoURL    *string `json:"photo_url"`
	Note        *string `json:"note"`
	Status      *string `json:"status"`
	ZoneID      uint    `json:"zone_id"`
	Zone        *Zone   `gorm:"foreignKey:ZoneID" json:"zone"`

	GenderID uint    `json:"gender_id"`
	Gender   *Gender `gorm:"foreignKey:GenderID" json:"gender"`

	CreatedBys        []Dog              `gorm:"foreignKey:CreatedByID" json:"created_bys"`
	UpdatedBys        []Dog              `gorm:"foreignKey:UpdatedByID" json:"updated_bys"`
	DeletedBys        []Dog              `gorm:"foreignKey:DeletedByID" json:"deleted_bys"`
	
	DeletedByStaffs []Sponsorship `gorm:"foreignKey:DeletedByStaffID" json:"deleted_by_staffs"`

	KennelManagements []KennelManagement `gorm:"foreignKey:StaffID" json:"kennel_managements"`
	MedicalRecords    []MedicalRecord    `gorm:"foreignKey:StaffID" json:"medical_records"`
}
