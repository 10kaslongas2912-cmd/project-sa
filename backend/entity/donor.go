package entity

import "gorm.io/gorm"

type Donor struct {
	gorm.Model
	Firstname *string `json:"firstname"`
	Lastname  *string `json:"lastname"`
	Phone     *string `json:"phone"`
	Email     *string `json:"email"`
	DonorType *string `json:"donor_type"`

	UserID *uint `json:"user_id"`
	User   *User `gorm:"foreignKey:UserID"`

	Donations []Donation `gorm:"foreignKey:DonorID"`
}