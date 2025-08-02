package entity

import (
	"time"
)

type Users struct {
	UserID      uint      `gorm:"primarykey;autoIncrement" json:"user_id"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phone_number"`
	UserName    string    `json:"username"`
	Password    string    `json:"-"`

	GenderID *uint   `json:"gender_id"` // Foreign key for Genders
	Gender   Genders `gorm:"references:ID"` // Association to Genders

	Donors []Donors `gorm:"foreignKey:UserID"`
}
