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
	)

	GenderMale := entity.Genders{Gender: "ชาย"}
	GenderFemale := entity.Genders{Gender: "หญิง"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "ชาย"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "หญิง"})

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
