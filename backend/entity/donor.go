package entity

import "gorm.io/gorm"

type Donor struct {
	gorm.Model
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Phone     *string `json:"phone"`
	Email     *string `json:"email"`
	DonorType *string `json:"donor_type"`

	UserID *uint `json:"user_id"`
	User   *User `gorm:"foreignKey:UserID" json:"user"`

	Donations []Donation `gorm:"foreignKey:DonorID" json:"donations"`
}