package config

import (
	"fmt"
	"time"

	"example.com/project-sa/entity"
	"example.com/project-sa/services"
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
		&entity.Users{},
		&entity.Genders{},
		&entity.Donors{},
		&entity.Donations{},
		&entity.ItemDonations{},
		&entity.MoneyDonations{},
		&entity.PaymentMethods{},
		&entity.Dog{},
		&entity.Breed{},
		&entity.Kennel{},
		&entity.MedicalRecord{},
		&entity.VaccineRecord{},
		&entity.Vaccine{},
		&entity.KennelManagement{},
		&entity.Roles{},
		&entity.Skills{},
		&entity.Staffs{},
		&entity.Volunteers{},
		&entity.Zones{},
	)

	// Clear existing Dog data before seeding to ensure fresh data for testing
	db.Exec("DELETE FROM dogs")
	db.Exec("DELETE FROM breeds")
	db.Exec("DELETE FROM kennels")

	PaymentCreditCard := entity.PaymentMethods{Name: "บัตรเครดิต"}
	PaymentBankTransfer := entity.PaymentMethods{Name: "โอนเงินผ่านธนาคาร"}

	db.FirstOrCreate(&PaymentCreditCard, &entity.PaymentMethods{Name: "บัตรเครดิต"})
	db.FirstOrCreate(&PaymentBankTransfer, &entity.PaymentMethods{Name: "โอนเงินผ่านธนาคาร"})

	GenderMale := entity.Genders{Gender: "ชาย"}
	GenderFemale := entity.Genders{Gender: "หญิง"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "ชาย"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "หญิง"})

	// Seed Breed
	BreedGolden := entity.Breed{BreedName: "Golden Retriever", Description: "Friendly and intelligent."}
	BreedPoodle := entity.Breed{BreedName: "Poodle", Description: "Intelligent and active."}
	BreedBulldog := entity.Breed{BreedName: "Bulldog", Description: "Calm and courageous."}

	db.FirstOrCreate(&BreedGolden, &entity.Breed{BreedName: "Golden Retriever"})
	db.FirstOrCreate(&BreedPoodle, &entity.Breed{BreedName: "Poodle"})
	db.FirstOrCreate(&BreedBulldog, &entity.Breed{BreedName: "Bulldog"})

	// Seed Kennel
	KennelA := entity.Kennel{Location: "Zone A", Capacity: 10, Color: "Blue", Notes: "Quiet area"}
	KennelB := entity.Kennel{Location: "Zone B", Capacity: 8, Color: "Green", Notes: "Playful area"}

	db.FirstOrCreate(&KennelA, &entity.Kennel{Location: "Zone A"})
	db.FirstOrCreate(&KennelB, &entity.Kennel{Location: "Zone B"})

	// Seed Dogs
	Dog1 := entity.Dog{
		Name:        "Buddy",
		Gender:      "Male",
		DateOfBirth: time.Date(2022, 5, 10, 0, 0, 0, 0, time.UTC),
		DateArrived: time.Date(2023, 1, 15, 0, 0, 0, 0, time.UTC),
		IsAdopted:   false,
		PhotoURL:    "http://localhost:8000/static/images/lucy.jpg",
		Character:   "Playful",
		BreedID:     BreedGolden.BreedID,
		KennelID:    KennelA.KennelID,
	}
	Dog2 := entity.Dog{
		Name:        "Lucy",
		Gender:      "Female",
		DateOfBirth: time.Date(2021, 8, 20, 0, 0, 0, 0, time.UTC),
		DateArrived: time.Date(2022, 10, 1, 0, 0, 0, 0, time.UTC),
		IsAdopted:   false,
		PhotoURL:    "http://localhost:8000/static/images/lucy.jpg",
		Character:   "Calm",
		BreedID:     BreedPoodle.BreedID,
		KennelID:    KennelB.KennelID,
	}
	Dog3 := entity.Dog{
		Name:        "Max",
		Gender:      "Male",
		DateOfBirth: time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC),
		DateArrived: time.Date(2023, 6, 1, 0, 0, 0, 0, time.UTC),
		IsAdopted:   false,
		PhotoURL:    "http://localhost:8000/static/images/lucy.jpg",
		Character:   "Energetic",
		BreedID:     BreedBulldog.BreedID,
		KennelID:    KennelA.KennelID,
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
		DogID:         Dog1.DogID, // Link to Dog1
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
		DogID:         Dog2.DogID, // Link to Dog2
	}

	db.FirstOrCreate(&MedRec1, &entity.MedicalRecord{DogID: Dog1.DogID, DateRecord: time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC)})
	db.First(&MedRec1, "dog_id = ? AND date_record = ?", Dog1.DogID, time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC))
	db.FirstOrCreate(&MedRec2, &entity.MedicalRecord{DogID: Dog2.DogID, DateRecord: time.Date(2023, 3, 10, 0, 0, 0, 0, time.UTC)})
	db.First(&MedRec2, "dog_id = ? AND date_record = ?", Dog2.DogID, time.Date(2023, 3, 10, 0, 0, 0, 0, time.UTC))

	// Seed VaccineRecord
	VaxRec1 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "ABC12345",
		NextDueDate: time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.MedID,           // Link to MedRec1
		VaccineID:   VaccineRabies.VaccineID, // Link to VaccineRabies
	}
	VaxRec2 := entity.VaccineRecord{
		DoseNumber:  1,
		LotNumber:   "XYZ98765",
		NextDueDate: time.Date(2024, 3, 10, 0, 0, 0, 0, time.UTC),
		MedID:       MedRec1.MedID,              // Link to MedRec1
		VaccineID:   VaccineDistemper.VaccineID, // Link to VaccineDistemper
	}

	db.FirstOrCreate(&VaxRec1, &entity.VaccineRecord{MedID: MedRec1.MedID, VaccineID: VaccineRabies.VaccineID})
	db.First(&VaxRec1, "med_id = ? AND vaccine_id = ?", MedRec1.MedID, VaccineRabies.VaccineID)
	db.FirstOrCreate(&VaxRec2, &entity.VaccineRecord{MedID: MedRec1.MedID, VaccineID: VaccineDistemper.VaccineID})
	db.First(&VaxRec2, "med_id = ? AND vaccine_id = ?", MedRec1.MedID, VaccineDistemper.VaccineID)

	// Seed Donors
	Donor1 := entity.Donors{
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john.doe@example.com",
		Phone:     "0812345678",
	}
	Donor2 := entity.Donors{
		FirstName: "Jane",
		LastName:  "Smith",
		Email:     "jane.smith@example.com",
		Phone:     "0898765432",
	}

	db.FirstOrCreate(&Donor1, &entity.Donors{Email: "john.doe@example.com"})
	db.FirstOrCreate(&Donor2, &entity.Donors{Email: "jane.smith@example.com"})

	// Seed Donations
	Donation1 := entity.Donations{
		DonationDate: time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC),
		DonationType: "Money",
		DonorID:      Donor1.DonorID,
	}
	Donation2 := entity.Donations{
		DonationDate: time.Date(2023, 7, 5, 0, 0, 0, 0, time.UTC),
		DonationType: "Item",
		DonorID:      Donor2.DonorID,
	}

	db.FirstOrCreate(&Donation1, &entity.Donations{DonorID: Donor1.DonorID, DonationDate: time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC)})
	db.FirstOrCreate(&Donation2, &entity.Donations{DonorID: Donor2.DonorID, DonationDate: time.Date(2023, 7, 5, 0, 0, 0, 0, time.UTC)})

	// Seed MoneyDonations
	MoneyDonation1 := entity.MoneyDonations{
		Amount:     1000.00,
		DonationID: Donation1.DonationID,          // Link to Donation1
		PaymentID:  PaymentBankTransfer.PaymentID, // Link to PaymentMethods
	}
	db.FirstOrCreate(&MoneyDonation1, &entity.MoneyDonations{DonationID: Donation1.DonationID, PaymentID: PaymentBankTransfer.PaymentID})

	// Seed ItemDonations
	ItemDonation1 := entity.ItemDonations{
		ItemName:   "Dog Food",
		Quantity:   5,
		DonationID: Donation2.DonationID, // Link to Donation2
	}
	db.FirstOrCreate(&ItemDonation1, &entity.ItemDonations{DonationID: Donation2.DonationID})

	hashedPassword, _ := services.HashPassword("123456")
	User := &entity.Users{
		FirstName:   "Software",
		LastName:    "Analysis",
		Email:       "sa@gmail.com",
		Password:    hashedPassword,
		PhoneNumber: "0123456789",
		UserName:    "sa",
		DateOfBirth: time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC),
	}
	db.FirstOrCreate(User, &entity.Users{
		UserName: "sa",
	})
}
