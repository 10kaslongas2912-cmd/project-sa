package entity

import "time"

type Donations struct {
	DonationID   uint      `gorm:"primarykey;autoIncrement" json:"donation_id"`
	DonationDate time.Time `json:"donation_date"`
	DonationType string    `json:"donation_type"`
	Status       string    `json:"status"`
	Description  string    `json:"description"`

	DonorID      uint      `json:"donor_id"`
	Donor        Donors    `gorm:"foreignKey:DonorID"`

	ItemDonations []ItemDonations `gorm:"foreignKey:DonationID"`
	MoneyDonations []MoneyDonations `gorm:"foreignKey:DonationID"`
}
