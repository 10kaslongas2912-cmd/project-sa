package entity

import (
	"gorm.io/gorm"
)


type Building struct {
	gorm.Model
	BuildingName string `json:"building_name"`
	Size      string  `json:"size"`   // small, medium, large

	// StaffID uint `json:"staff_id`
	// Staff *Staff `gorm:"foreignKey:StaffID`
	// KennelManagements []KenelManagement `gorm:"foreignKey:BuildingID"`
}