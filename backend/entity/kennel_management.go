package entity

import (
	"gorm.io/gorm"
)

type KennelManagement struct {
	gorm.Model
	StaffID    uint      `json:"staff_id"`
	Staff      *Staff    `gorm:"foreignKey:StaffID" json:"staff"`
	KennelID   uint      `json:"kennel_id"`
	Kennel     *Kennel   `gorm:"foreignKey:KennelID" json:"kennel"`
}
