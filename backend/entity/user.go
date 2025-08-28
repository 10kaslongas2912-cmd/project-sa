package entity

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Firstname   string    `json:"firstname"`
	Lastname    string    `json:"lastname"`
	DateOfBirth string `json:"date_of_birth"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	Username    string    `json:"username"`
	Password    string    `json:"-"`

	GenderID uint  `json:"gender_id"`     // Foreign key for Genders
	Gender   *Gender `gorm:"references:ID"` // Association to Genders

	Donors   []Donor   `gorm:"foreignKey:UserID"`
	Sponsors []Sponsor `gorm:"foreignKey:UserID"`
	Adopters []Adopter `gorm:"foreignKey:UserID"`
}
