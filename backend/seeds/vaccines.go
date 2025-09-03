package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedVaccines(db *gorm.DB) error {

	VaccineRabies := entity.Vaccine{Name: "Rabies", Manufacturer: "VetCorp"}
	VaccineDistemper := entity.Vaccine{Name: "Distemper", Manufacturer: "PetHealth"}

	if err := db.FirstOrCreate(&VaccineRabies, &entity.Vaccine{Name: "Rabies"}).Error; err!= nil {
		return err
	}
	
	if err := db.FirstOrCreate(&VaccineDistemper, &entity.Vaccine{Name: "Distemper"}).Error; err != nil {
		return err
	}
	
	return nil
}
