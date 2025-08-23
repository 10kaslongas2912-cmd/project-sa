package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	RoleName string `gorm:"size:50;not null;unique"`
	Staffs   []Staff `gorm:"foreignKey:RoleID"`
}