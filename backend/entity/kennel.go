package entity

import "gorm.io/gorm"

type Kennel struct {
	gorm.Model
	Location string `json:"location"`
	Capacity uint   `json:"capacity"`
	Color    string `json:"color"`
	Notes    string `json:"notes"`
	StaffID  uint   `json:"staff_id"`
	Staff    *Staff `gorm:"foreignKey:StaffID"`

	Dogs   []Dog   `gorm:"foreignKey:KennelID"`
}
