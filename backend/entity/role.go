package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name string `json:"name"` 
	Staffs   []Staff `gorm:"foreignKey:RoleID"`
}