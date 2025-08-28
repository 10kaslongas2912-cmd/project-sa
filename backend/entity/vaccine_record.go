package entity

import (
	"time"
	"gorm.io/gorm"
)

type VaccineRecord struct {
	gorm.Model
	DoseNumber  int       `json:"dose_number"`
	LotNumber   string    `json:"lot_number"`
	NextDueDate time.Time `json:"next_due_date"`

	MedID         uint           `json:"med_id"`
	MedicalRecord *MedicalRecord `gorm:"foreignKey:MedID"`

	VaccineID uint     `json:"vaccine_id"`
	Vaccine   *Vaccine `gorm:"foreignKey:VaccineID"`
}
