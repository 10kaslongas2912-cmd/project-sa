package entity

import (
	"gorm.io/gorm"
)

type Staff struct {
	gorm.Model
	UserID uint  `json:"user_id"`
	User   *User `gorm:"foreignKey:UserID"`

	RoleID uint  `json:"role_id"`           // Foreign key for Roles
	Role   *Role `gorm:"foreignKey:RoleID"` // Association to Roles

	// Buildings []Building `gorm:foreignKey:StaffID`
	Kennels        []Kennel        `gorm:"foreignKey:StaffID"`
	Events         []Event         `gorm:"foreignKey:StaffID"`
	MedicalRecords []MedicalRecord `gorm:"foreignKey:StaffID"`
}
