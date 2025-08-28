package entity

import "gorm.io/gorm"

type Kennel struct {
	gorm.Model
	Capacity uint   `json:"capacity"`
	Color    string `json:"color"`
	Note    *string `json:"note"`

	ZoneID uint  `json:"zone_id"`
	Zone   *Zone `gorm:"foreignKey:ZoneID"`

	KenelManagements []KenelManagement `gorm:"foreignKey:KennelID"`
	Dogs []Dog `gorm:"foreignKey:KennelID"`
}
