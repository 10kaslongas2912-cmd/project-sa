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
		&entity.Visitor{},
		&entity.Visit{},
		&entity.VisitDetail{},
	)}
	func CreateIndexes(db *gorm.DB) error {
	// Event indexes for better performance
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at)").Error; err != nil {
		return err
	}
	
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_end_at ON events(end_at)").Error; err != nil {
		return err
	}
	
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_name ON events(name)").Error; err != nil {
		return err
	}
	
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer)").Error; err != nil {
		return err
	}
	
	// Foreign key indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_visit_id ON events(visit_id)").Error; err != nil {
		return err
	}
	
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_events_medical_record_id ON events(medical_record_id)").Error; err != nil {
		return err
	}
	
	return nil
}