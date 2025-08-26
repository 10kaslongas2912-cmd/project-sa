package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phone_number"`
	UserName    string    `json:"username"`
	Password    string    `json:"-"`

	GenderID *uint   `json:"gender_id"`     // Foreign key for Genders
	Gender   Gender `gorm:"references:ID"` // Association to Genders

	Donors []Donor `gorm:"foreignKey:UserID"`
	Sponsors []Sponsor `gorm:"foreignKey:UserID"`
	Adopters []Adopter `gorm:"foreignKey:UserID"`
	Staffs  []Staff  `gorm:"foreignKey:UserID"`
}
