package seeds

import (
	"time"

	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedVaccineRecords(db *gorm.DB) error {
	var MedRecs []entity.MedicalRecord
	if err := db.Order("id ASC").Limit(1).Find(&MedRecs).Error; err != nil {
		return err
	}
	MedRec1 := MedRecs[0] 
	
	var VaccineRabies,VaccineDistemper entity.Vaccine
	if err := db.Where("name = ?", "Rabies").First(&VaccineRabies).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Distemper").First(&VaccineDistemper).Error; err != nil {
		return err
	}
	
	VaxRec1 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "ABC12345",
		NextDueDate: time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.ID,           // Link to MedRec1
		VaccineID:   VaccineRabies.ID, // Link to VaccineRabies
	}
	VaxRec2 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "XYZ98765",
		NextDueDate: time.Date(2024, 3, 10, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.ID,              // Link to MedRec1
		VaccineID:   VaccineDistemper.ID, // Link to VaccineDistemper
	}

	if err := db.FirstOrCreate(&VaxRec1).Error; err != nil {
		return err
	}
	if err := db.FirstOrCreate(&VaxRec2).Error; err != nil {
		return err
	}
	// db.FirstOrCreate(&VaxRec1, &entity.VaccineRecord{MedID: MedRec1.MedID, VaccineID: VaccineRabies.VaccineID})
	// db.First(&VaxRec1, "med_id = ? AND vaccine_id = ?", MedRec1.MedID, VaccineRabies.VaccineID)
	// db.FirstOrCreate(&VaxRec2, &entity.VaccineRecord{MedID: MedRec1.MedID, VaccineID: VaccineDistemper.VaccineID})
	// db.First(&VaxRec2, "med_id = ? AND vaccine_id = ?", MedRec1.MedID, VaccineDistemper.VaccineID)
	return nil
}
