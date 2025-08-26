package entity

import (
	"time"

	"gorm.io/gorm"
)

type VaccineRecord struct {
	gorm.Model
	DoseNumber  int       `json:"doseNumber"`
	LotNumber   string    `json:"lotNumber"`
	NextDueDate time.Time `json:"nextDueDate"`

	MedID         uint           `json:"MedId"`
	MedicalRecord *MedicalRecord `gorm:"foreignKey:MedID"`

	VaccineID uint     `json:"vaccine_id"`
	Vaccine   *Vaccine `gorm:"foreignKey:VaccineID"`
}
