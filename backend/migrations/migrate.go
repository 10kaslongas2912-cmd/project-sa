package migrations

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&entity.Adopter{},
		&entity.Adoption{},
		&entity.AnimalSex{},
		&entity.Attendee{},
		&entity.Breed{},
		&entity.Building{},
		&entity.Dog{},
		&entity.Donation{},
		&entity.Donor{},
		&entity.Event{},
		&entity.Gender{},
		&entity.ItemDonation{},
		&entity.KenelManagement{},
		&entity.Kennel{},
		&entity.MedicalRecord{},
		&entity.MoneyDonation{},
		&entity.PaymentMethod{},
		&entity.Role{},
		&entity.Sponsor{},
		&entity.SponsorshipCycle{},
		&entity.SponsorshipPayment{},
		&entity.Sponsorship{},
		&entity.Staff{},
		&entity.User{},
		&entity.Vaccine{},
		&entity.VaccineRecord{},
		&entity.Volunteer{},
		&entity.Zone{},
	)
}