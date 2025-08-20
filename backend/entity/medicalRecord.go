package entity

import "time"

type MedicalRecord struct {
	MedID      int     `gorm:"primaryKey" json:"id"`
	DateRecord time.Time    `json:"date_record"`
	Weight     float64 `json:"weight"`
	Temperature float64 `json:"temperature"`
	Symptoms   string  `json:"symptoms"`
	Diagnosis  string  `json:"diagnosis"`
	TreatmentPlan  string  `json:"treatment"`
	Medication string  `json:"medication"`
	Vaccination string  `json:"vaccination"` // should be "YES" or "NO"
	Notes      string  `json:"notes"` // Added Notes field

	DogID      uint     `json:"dog_id"`
	Dog        Dog    `gorm:"foreignKey:DogID"`

	VaccineRecord []VaccineRecord `gorm:"foreignKey:MedID"`
}