package seeds

import (
	"example.com/project-sa/services"
	"gorm.io/gorm"
)

/* ============== Public ============== */
const PublicBaseURL = "http://localhost:8000"

var pw, _ = services.HashPassword("10K")

func SeedAll(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := seedLookupsBase(tx); err != nil {
			return err
		}
		if err := seedStaffs(tx); err != nil {
			return err
		}
		if err := seedKennels(tx); err != nil {
			return err
		}
		if err := seedDogs(tx); err != nil {
			return err
		}
		if err := seedDogPersonalities(tx); err != nil {
			return err
		}
		if err := seedVaccines(tx); err != nil {
			return err
		}
		if err := seedMedicalRecords(tx); err != nil {
			return err
		}	
		if err := seedVaccineRecords(tx); err != nil {
			return err
		}
		if err := seedDonors(tx); err != nil {
			return err
		}
		if err := seedDonations(tx); err != nil {
			return err
		}
		if err := seedMoneyDonations(tx); err != nil {
			return err
		}
		if err := seedZones(tx); err != nil {
			return err
		}
		if err := seedSkills(tx); err != nil {
			return err
		}
		if err := seedStatusFV(tx); err != nil {
			return err
		}
		if err := seedUsers(tx); err != nil {
			return err
		}
		if err := seedBuildings(tx); err != nil {
			return err
		}
		if err := SeedEvents(tx); err != nil {
			return err
		}
		return nil
	})
}
