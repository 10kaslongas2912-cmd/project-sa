package entity

import (

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Title    *string  `json:"title"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	DateOfBirth string  `json:"date_of_birth"`
	Email       string  `gorm:"uniqueIndex" json:"email"`
	Phone       string  `json:"phone"`
	Username    string  `gorm:"uniqueIndex" json:"username"`
	Password    string  `json:"-"`
	PhotoURL    *string `json:"photo_url"`
	GenderID    uint    `json:"gender_id"`           // Foreign key for Genders
	Gender      *Gender `gorm:"foreignKey:GenderID" json:"gender"` // Association to Genders

	Donors   []Donor   `gorm:"foreignKey:UserID" json:"donors"`
	Sponsor Sponsor `gorm:"constraint:OnDelete:CASCADE;" json:"sponsor"`
	Adopters []Adopter `gorm:"foreignKey:UserID" json:"adopters"`
}
