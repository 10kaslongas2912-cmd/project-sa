package entity

import (
	"gorm.io/gorm"
)

type Zone struct {
	gorm.Model
	ZoneName string `gorm:"size:50;not null;unique"`
	Staffs   []Staff `gorm:"foreignKey:ZoneID"`
	Kennels  []Kennel `gorm:"foreignKey:ZoneID"`
}

