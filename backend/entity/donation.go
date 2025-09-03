package entity

import (
	"time"

	"gorm.io/gorm"
)

type Donation struct {
	gorm.Model
	DonationDate time.Time `json:"donation_date"`
	DonationType string    `json:"donation_type"`
	Status       string    `json:"status"`
	Description  string    `json:"description"`
	DonorID      uint      `json:"donor_id"`
	Donor        *Donor    `gorm:"foreignKey:DonorID"`
	ItemDonations []ItemDonation `gorm:"foreignKey:DonationID"`
	MoneyDonations []MoneyDonation `gorm:"foreignKey:DonationID"`
}