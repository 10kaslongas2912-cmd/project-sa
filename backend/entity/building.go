package entity

import (
	"gorm.io/gorm"
)


type Building struct {
	gorm.Model
	BuildingName string `gorm:"size:50;not null;unique"`
	Staffs       []Staff `gorm:"foreignKey:BuildingID"`
	Sizes      string `gorm:"size:20;not null"` // small, medium, large
	KennelManagements []KenelManagement `gorm:"foreignKey:BuildingID"`
}