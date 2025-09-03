package seeds

import (
	"time"
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedDonations(db *gorm.DB) error {

	var Donor1, Donor2 entity.Donor
	if err := db.First(&Donor1, "firstname = ? AND lastname = ?", "John","Doe").Error; err != nil { return err}
	if err := db.First(&Donor2, "firstname = ? AND lastname = ?", "Jane","Smith").Error; err != nil { return err}

	Donation1 := entity.Donation{	
		DonationDate: time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC),
		DonationType: "Money",
		DonorID:      Donor1.ID,
	}
	Donation2 := entity.Donation{
		DonationDate: time.Date(2023, 7, 5, 0, 0, 0, 0, time.UTC),
		DonationType: "Item",
		DonorID:      Donor2.ID,
	}

	if err := db.FirstOrCreate(&Donation1).Error; err != nil { return err }
	if err := db.FirstOrCreate(&Donation2).Error; err != nil { return err }
	// db.FirstOrCreate(&Donation1, &entity.Donation{DonorID: Donor1.ID, DonationDate: time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC)})
	// db.FirstOrCreate(&Donation2, &entity.Donation{DonorID: Donor2.ID, DonationDate: time.Date(2023, 7, 5, 0, 0, 0, 0, time.UTC)})
	return nil
}

// Seed Donations
