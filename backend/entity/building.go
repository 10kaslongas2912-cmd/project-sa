package entity

import (
	"gorm.io/gorm"
)


type Building struct {
	gorm.Model
	BuildingName string 
	Sizes      string  // small, medium, large

	// StaffID uint `json:"staff_id`
	// Staff *Staff `gorm:"foreignKey:StaffID`
	// KennelManagements []KenelManagement `gorm:"foreignKey:BuildingID"`
}