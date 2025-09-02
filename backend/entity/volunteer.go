package entity

import (
	"gorm.io/gorm"
)

type Volunteer struct {
	gorm.Model
	UserID uint `json:"user_id"`
	User  *User `gorm:"foreignKey:UserID" json:"user"`
	Skills string `json:"skills"`
	Role  string `json:"role"` // admin, staff, vet, caretaker
	Notes string `json:"notes"`
}