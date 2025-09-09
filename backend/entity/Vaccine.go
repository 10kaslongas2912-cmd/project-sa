package entity

import "gorm.io/gorm"

type Vaccine struct {
	gorm.Model
	Name         string `json:"name"`
	Manufacturer string `json:"manufacturer"`
	VaccineRecords []VaccineRecord `gorm:"foreignKey:VaccineID" json:"vaccine_records"`
}