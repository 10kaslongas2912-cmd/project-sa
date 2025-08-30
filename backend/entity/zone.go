package entity

import (
	"gorm.io/gorm"
)

type Zone struct {
	gorm.Model
	Name string `json:"name"`
	Staffs   []Staff `gorm:"foreignKey:ZoneID" json:"staffs"`
	Kennels  []Kennel `gorm:"foreignKey:ZoneID" json:"kennels"`
}

