package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Firstname   string    `json:"firstname"`
	Lastname    string    `json:"lastname"`
	DateOfBirth time.Time `json:"date_of_birth" gorm:"type:date"`
	Email       string    `gorm:"uniqueIndex" json:"email"`
	Phone       string    `json:"phone"`
	Username    string    `gorm:"uniqueIndex" json:"username"`
	Password    string    `json:"-"`
	PhotoURL    *string   `json:"photo_url"`
	GenderID    uint      `json:"gender_id"`           // Foreign key for Genders
	Gender      *Gender   `gorm:"foreignKey:GenderID"` // Association to Genders

	Donors   []Donor   `gorm:"foreignKey:UserID"`
	Sponsors []Sponsor `gorm:"foreignKey:UserID"`
	Adopters []Adopter `gorm:"foreignKey:UserID"`
}
