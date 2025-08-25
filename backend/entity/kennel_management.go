package entity

import (
	"gorm.io/gorm"
)

type KenelManagement struct {
	gorm.Model
	StaffID  uint  `json:"staff_id"`
	Staff    Staff `gorm:"foreignKey:StaffID"`
	KennelID uint  `json:"kennel_id"`
	Kennel   Kennel `gorm:"foreignKey:KennelID"`
}