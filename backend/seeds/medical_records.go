package seeds

import (
	"time"

	"gorm.io/gorm"

	"example.com/project-sa/entity"
)

func seedMedicalRecords(db *gorm.DB) error {
	var dog1, dog2 entity.Dog
	if err := db.Where("name = ?", "Nam").First(&dog1).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Taa").First(&dog2).Error; err != nil {
		return err
	}
	var staff1, staff2 entity.Staff
	if err := db.Where("username = ?", "manager1").First(&staff1).Error; err != nil {
		return err
	}
	if err := db.Where("username = ?", "manager2").First(&staff2).Error; err != nil {
		return err
	}

	MedRec1 := entity.MedicalRecord{
		DateRecord:    time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC),
		Weight:        25.5,
		Temperature:   38.0,
		Symptoms:      "None",
		Diagnosis:     "Healthy",
		TreatmentPlan: "Routine checkup",
		Medication:    "None",
		Vaccination:   "YES",
		DogID:         dog1.ID, // Link to Dog1
		StaffID:       staff1.ID,
	}
	MedRec2 := entity.MedicalRecord{
		DateRecord:    time.Date(2023, 3, 10, 0, 0, 0, 0, time.UTC),
		Weight:        12.0,
		Temperature:   38.5,
		Symptoms:      "Coughing",
		Diagnosis:     "Kennel Cough",
		TreatmentPlan: "Antibiotics",
		Medication:    "Doxycycline",
		Vaccination:   "NO",
		DogID:         dog2.ID, // Link to Dog2
		StaffID:       staff2.ID,
	}

	if err := db.FirstOrCreate(&MedRec1).Error; err != nil {
		return err
	}
	if err := db.FirstOrCreate(&MedRec2).Error; err != nil {
		return err
	}

	return nil
}
