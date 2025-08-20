package entity

import "time"
type VaccineRecord struct {
	VaxRecordID int `json:"vaxRecordID"`
	DoseNumber  int `json:"doseNumber"`
	LotNumber   string `json:"lotNumber"`
	NextDueDate time.Time `json:"nextDueDate"`


	MedID     int `json:"MedId"`
	Med     MedicalRecord `gorm:"foreignKey:MedID"`

	VaccineID uint `json:"VaccineId"`
	Vaccine   Vaccine `gorm:"foreignKey:VaccineID"`
}