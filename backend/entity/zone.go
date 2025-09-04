package entity

import (
	"gorm.io/gorm"
)

type Zone struct {
	gorm.Model
	ZoneName string  `json:"zone_name"`
	KennelID uint    `json:"kennel_id"`           // Foreign key to Kennel
	Kennel   *Kennel `gorm:"references:KennelID"` // Association to Kennel
}
