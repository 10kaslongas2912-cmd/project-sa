package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name string `gorm:"size:50;not null;unique" json:"name"` 
	Staffs   []Staff `gorm:"foreignKey:RoleID"`
}