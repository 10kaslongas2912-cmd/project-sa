package entity

import (
	"time"

	"gorm.io/gorm"
)

type MedicalRecord struct {
	gorm.Model
	DateRecord    time.Time `json:"date_record"`
	Weight        float64   `json:"weight"`
	Temperature   float64   `json:"temperature"`
	Symptoms      string    `json:"symptoms"`
	Diagnosis     string    `json:"diagnosis"`
	TreatmentPlan string    `json:"treatment"`
	Medication    string    `json:"medication"`
	Vaccination   string    `json:"vaccination"` // should be "YES" or "NO"
	Notes         string    `json:"notes"`       // Added Notes field

	DogID uint `json:"dog_id"`
	Dog   *Dog  `gorm:"foreignKey:DogID" json:"dog"`

	StaffID uint  `json:"staff_id"` // Foreign key for Staff
	Staff   *Staff `gorm:"foreignKey:StaffID" json:"staff"` // Association to Staff

	VaccineRecords []VaccineRecord `gorm:"foreignKey:MedID" json:"vaccine_records"`
}
