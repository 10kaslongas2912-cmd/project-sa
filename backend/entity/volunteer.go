package entity

import (
	"gorm.io/gorm"
)

type Volunteer struct {
	gorm.Model
	UserID uint `json:"user_id"`
	User  Users `gorm:"foreignKey:UserID"`
	Skills string `json:"skills"`
	Role  string `json:"role"` // admin, staff, vet, caretaker
	Notes string `json:"notes"`
}