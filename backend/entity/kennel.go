package entity

import "gorm.io/gorm"

type Kennel struct {
	gorm.Model
	Name	string `json:"name"`
	Capacity uint   `json:"capacity"`
	Color    string `json:"color"`
	Note    *string `json:"note"`

	ZoneID uint  `json:"zone_id"`
	Zone   *Zone `gorm:"foreignKey:ZoneID" json:"zone"`

	KennelManagements []KennelManagement `gorm:"foreignKey:KennelID" json:"kennel_managements"`
	Dogs []Dog `gorm:"foreignKey:KennelID" json:"dogs"`
}
