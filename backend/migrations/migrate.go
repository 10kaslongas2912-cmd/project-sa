package migrations

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&entity.Breed{},
		&entity.Gender{},
		&entity.AnimalSex{},
		&entity.AnimalSize{},
		&entity.Personality{},
		&entity.Role{},
		&entity.Zone{},
		&entity.Vaccine{},
		&entity.Kennel{},
		&entity.Adopter{},
		&entity.Adoption{},
		&entity.Attendee{},
		&entity.Building{},
		&entity.Dog{},
		&entity.DogPersonality{},
		&entity.Donation{},
		&entity.Donor{},
		&entity.Event{},
		&entity.ItemDonation{},
		&entity.KennelManagement{},
		&entity.MedicalRecord{},
		&entity.MoneyDonation{},
		&entity.PaymentMethod{},
		&entity.Sponsor{},
		&entity.Subscription{},
		&entity.SponsorshipPayment{},
		&entity.Sponsorship{},
		&entity.Staff{},
		&entity.User{},
		&entity.VaccineRecord{},
		&entity.Volunteer{},
		&entity.Visit{},
		&entity.VisitDetail{},
	)
}