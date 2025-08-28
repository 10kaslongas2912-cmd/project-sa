package entity

import (
	"gorm.io/gorm"
)

type Zone struct {
	gorm.Model
	ZoneName string `json:"zone_name"`
	Staffs   []Staff `gorm:"foreignKey:ZoneID"`
	Kennels  []Kennel `gorm:"foreignKey:ZoneID"`
}

