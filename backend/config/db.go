package config

import (
	"fmt"
	"time"

	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"example.com/project-sa/utils/pointer"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {
	db.AutoMigrate(
		&entity.User{},
		&entity.Gender{},
		&entity.Donor{},
		&entity.Donation{},
		&entity.ItemDonation{},
		&entity.MoneyDonation{},
		&entity.PaymentMethod{},
		&entity.Dog{},
		&entity.Breed{},
		&entity.Kennel{},
		&entity.MedicalRecord{},
		&entity.VaccineRecord{},
		&entity.Vaccine{},
		&entity.KennelManagement{},
		&entity.Role{},
		&entity.Skill{},
		&entity.Staff{},
		&entity.Volunteer{},
		&entity.Zone{},
		&entity.StatusFV{},
	)

	// Clear existing Dog data before seeding to ensure fresh data for testing
	db.Exec("DELETE FROM dogs")
	db.Exec("DELETE FROM breeds")
	db.Exec("DELETE FROM kennels")

	PaymentCreditCard := entity.PaymentMethod{Name: "บัตรเครดิต"}
	PaymentBankTransfer := entity.PaymentMethod{Name: "โอนเงินผ่านธนาคาร"}

	db.FirstOrCreate(&PaymentCreditCard, &entity.PaymentMethod{Name: "บัตรเครดิต"})
	db.FirstOrCreate(&PaymentBankTransfer, &entity.PaymentMethod{Name: "โอนเงินผ่านธนาคาร"})

	GenderMale := entity.Gender{Name: "ชาย"}
	GenderFemale := entity.Gender{Name: "หญิง"}

	db.FirstOrCreate(&GenderMale, &entity.Gender{Name: "ชาย"})
	db.FirstOrCreate(&GenderFemale, &entity.Gender{Name: "หญิง"})

	// Seed Breed
	BreedGolden := entity.Breed{Name: "Golden Retriever", Description: "Friendly and intelligent."}
	BreedPoodle := entity.Breed{Name: "Poodle", Description: "Intelligent and active."}
	BreedBulldog := entity.Breed{Name: "Bulldog", Description: "Calm and courageous."}

	db.FirstOrCreate(&BreedGolden, &entity.Breed{Name: "Golden Retriever"})
	db.FirstOrCreate(&BreedPoodle, &entity.Breed{Name: "Poodle"})
	db.FirstOrCreate(&BreedBulldog, &entity.Breed{Name: "Bulldog"})

	ZoneA := entity.Zone{Name: "A"}
	ZoneB := entity.Zone{Name: "B"}

	db.FirstOrCreate(&ZoneA, &entity.Zone{Name: "A"})
	db.FirstOrCreate(&ZoneB, &entity.Zone{Name: "B"})
	// Seed Kennel
	KennelA := entity.Kennel{Name: "A-1", Capacity: 10, Color: "Blue", Note: pointer.P("Quiet area"), ZoneID: ZoneA.ID}
	KennelB := entity.Kennel{Name: "B-1", Capacity: 8, Color: "Green", Note: pointer.P("Playful area"), ZoneID: ZoneB.ID}

	db.FirstOrCreate(&KennelA, &entity.Kennel{ZoneID: ZoneA.ID})
	db.FirstOrCreate(&KennelB, &entity.Kennel{ZoneID: ZoneB.ID})

	// Seed Dogs
	Dog1 := entity.Dog{
		Name:          "Buddy",
		AnimalSexID:   1,
		DateOfBirth:   time.Date(2022, 5, 10, 0, 0, 0, 0, time.UTC),
		DateOfArrived: time.Date(2023, 1, 15, 0, 0, 0, 0, time.UTC),
		IsAdopted:     false,
		PhotoURL:      "http://localhost:8000/static/images/lucy.jpg",
		Character:     "Playful",
		BreedID:       BreedGolden.ID,
		KennelID:      KennelA.ID,
	}
	Dog2 := entity.Dog{
		Name:          "Lucy",
		AnimalSexID:   2,
		DateOfBirth:   time.Date(2021, 8, 20, 0, 0, 0, 0, time.UTC),
		DateOfArrived: time.Date(2022, 10, 1, 0, 0, 0, 0, time.UTC),
		IsAdopted:     false,
		PhotoURL:      "http://localhost:8000/static/images/lucy.jpg",
		Character:     "Calm",
		BreedID:       BreedPoodle.ID,
		KennelID:      KennelB.ID,
	}
	Dog3 := entity.Dog{
		Name:          "Max",
		AnimalSexID:   1,
		DateOfBirth:   time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC),
		DateOfArrived: time.Date(2023, 6, 1, 0, 0, 0, 0, time.UTC),
		IsAdopted:     false,
		PhotoURL:      "http://localhost:8000/static/images/lucy.jpg",
		Character:     "Energetic",
		BreedID:       BreedBulldog.ID,
		KennelID:      KennelA.ID,
	}

	db.FirstOrCreate(&Dog1, &entity.Dog{Name: "Buddy"})
	db.First(&Dog1, "name = ?", "Buddy")
	db.FirstOrCreate(&Dog2, &entity.Dog{Name: "Lucy"})
	db.First(&Dog2, "name = ?", "Lucy")
	db.FirstOrCreate(&Dog3, &entity.Dog{Name: "Max"})
	db.First(&Dog3, "name = ?", "Max")

	// Seed Vaccine
	VaccineRabies := entity.Vaccine{Name: "Rabies", Manufacturer: "VetCorp"}
	VaccineDistemper := entity.Vaccine{Name: "Distemper", Manufacturer: "PetHealth"}

	db.FirstOrCreate(&VaccineRabies, &entity.Vaccine{Name: "Rabies"})
	db.FirstOrCreate(&VaccineDistemper, &entity.Vaccine{Name: "Distemper"})

	// Seed MedicalRecord
	MedRec1 := entity.MedicalRecord{
		DateRecord:    time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC),
		Weight:        25.5,
		Temperature:   38.0,
		Symptoms:      "None",
		Diagnosis:     "Healthy",
		TreatmentPlan: "Routine checkup",
		Medication:    "None",
		Vaccination:   "YES",
		DogID:         Dog1.ID, // Link to Dog1
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
		DogID:         Dog2.ID, // Link to Dog2
	}

	db.FirstOrCreate(&MedRec1, &entity.MedicalRecord{DogID: Dog1.ID, DateRecord: time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC)})
	db.First(&MedRec1, "dog_id = ? AND date_record = ?", Dog1.ID, time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC))
	db.FirstOrCreate(&MedRec2, &entity.MedicalRecord{DogID: Dog2.ID, DateRecord: time.Date(2023, 3, 10, 0, 0, 0, 0, time.UTC)})
	db.First(&MedRec2, "dog_id = ? AND date_record = ?", Dog2.ID, time.Date(2023, 3, 10, 0, 0, 0, 0, time.UTC))

	// Seed VaccineRecord
	VaxRec1 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "ABC12345",
		NextDueDate: time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.ID,       // Link to MedRec1
		VaccineID:   VaccineRabies.ID, // Link to VaccineRabies
	}
	VaxRec2 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "XYZ98765",
		NextDueDate: time.Date(2024, 3, 10, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.ID,          // Link to MedRec1
		VaccineID:   VaccineDistemper.ID, // Link to VaccineDistemper
	}

	db.FirstOrCreate(&VaxRec1, &entity.VaccineRecord{MedID: MedRec1.ID, VaccineID: VaccineRabies.ID})
	db.First(&VaxRec1, "med_id = ? AND vaccine_id = ?", MedRec1.ID, VaccineRabies.ID)
	db.FirstOrCreate(&VaxRec2, &entity.VaccineRecord{MedID: MedRec1.ID, VaccineID: VaccineDistemper.ID})
	db.First(&VaxRec2, "med_id = ? AND vaccine_id = ?", MedRec1.ID, VaccineDistemper.ID)

	// Seed Donors
	Donor1 := entity.Donor{
		Firstname: pointer.P("John"),
		Lastname:  pointer.P("Doe"),
		Email:     pointer.P("john.doe@example.com"),
		Phone:     pointer.P("0812345678"),
	}
	Donor2 := entity.Donor{
		Firstname: pointer.P("Jane"),
		Lastname:  pointer.P("Smith"),
		Email:     pointer.P("jane.smith@example.com"),
		Phone:     pointer.P("0898765432"),
	}

	db.FirstOrCreate(&Donor1, &entity.Donor{Email: pointer.P("john.doe@example.com")})
	db.FirstOrCreate(&Donor2, &entity.Donor{Email: pointer.P("jane.smith@example.com")})

	// Seed Donations
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

	db.FirstOrCreate(&Donation1, &entity.Donation{DonorID: Donor1.ID, DonationDate: time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC)})
	db.FirstOrCreate(&Donation2, &entity.Donation{DonorID: Donor2.ID, DonationDate: time.Date(2023, 7, 5, 0, 0, 0, 0, time.UTC)})

	// Seed MoneyDonations
	MoneyDonation1 := entity.MoneyDonation{
		Amount:          1000.00,
		DonationID:      Donation1.ID,           // Link to Donation1
		PaymentMethodID: PaymentBankTransfer.ID, // Link to PaymentMethods
	}
	db.FirstOrCreate(&MoneyDonation1, &entity.MoneyDonation{DonationID: Donation1.ID, PaymentMethodID: PaymentBankTransfer.ID})

	// Seed ItemDonations
	ItemDonation1 := entity.ItemDonation{
		ItemName:   "Dog Food",
		Quantity:   5,
		DonationID: Donation2.ID, // Link to Donation2
	}
	db.FirstOrCreate(&ItemDonation1, &entity.ItemDonation{DonationID: Donation2.ID})

	hashedPassword, _ := services.HashPassword("123456")
	User := &entity.User{
		Firstname:   "Software",
		Lastname:    "Analysis",
		Email:       "sa@gmail.com",
		Password:    hashedPassword,
		Phone:       "0123456789",
		Username:    "sa",
		DateOfBirth: time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC),
	}
	db.FirstOrCreate(User, &entity.User{
		Username: "sa",
	})

	// Seed Skills (idempotent)
	skillDescs := []string{
		"การดูแลสุนัข",
		"การฝึกสุนัข",
		"การจัดการเหตุฉุกเฉิน",
		"การสื่อสารและการประชาสัมพันธ์",
		"อื่นๆ",
	}
	for _, d := range skillDescs {
		var s entity.Skill
		db.FirstOrCreate(&s, entity.Skill{Description: d})
	}

}
