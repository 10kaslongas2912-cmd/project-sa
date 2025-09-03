package entity

import "gorm.io/gorm"

type Kennel struct {
	gorm.Model
	Name     string  `json:"name"`
	Capacity uint    `json:"capacity"`
	Color    string  `json:"color"`
	Note     *string `json:"note"`

	ZoneID uint  `json:"zone_id"`
	Zone   *Zone `gorm:"foreignKey:ZoneID"`

	KennelManagements []KennelManagement `gorm:"foreignKey:KennelID"`
	Dogs              []Dog              `gorm:"foreignKey:KennelID"`
}
