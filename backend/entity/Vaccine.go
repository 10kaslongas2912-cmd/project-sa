package entity

import "gorm.io/gorm"

type Vaccine struct {
	gorm.Model
	Name         string `json:"name"`
	Manufacturer string `json:"manufacturer"`

	VaccineRecord []VaccineRecord `gorm:"foreignKey:VaccineID"`
}