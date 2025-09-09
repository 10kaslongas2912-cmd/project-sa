package entity

import "gorm.io/gorm"

// Adopter model
type Adopter struct {
	gorm.Model
	FirstName   string  `json:"first_name" gorm:"not null"`
	LastName    string  `json:"last_name" gorm:"not null"`
	PhoneNumber string  `json:"phone_number" gorm:"not null"`
	Address     string  `json:"address" gorm:"not null"`
	District    string  `json:"district" gorm:"not null"`
	City        string  `json:"city" gorm:"not null"`
	Province    string  `json:"province" gorm:"not null"`
	ZipCode     string  `json:"zip_code" gorm:"not null"`
	Job         string  `json:"job" gorm:"not null"`
	Income      float64 `json:"income"`
	Status      string  `json:"status" gorm:"default:'pending'"` // pending, approved, rejected

	UserID *uint `json:"user_id,omitempty"`
	User   *User `json:"user,omitempty" gorm:"foreignKey:UserID"`

	DogID *uint `json:"dog_id" gorm:"not null"`
	Dog   *Dog  `json:"dog,omitempty" gorm:"foreignKey:DogID"`
}
