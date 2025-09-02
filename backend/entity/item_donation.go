package entity

import "gorm.io/gorm"

type ItemDonation struct {
	gorm.Model
	ItemName string `json:"item_name"`
	Quantity int    `json:"quantity"`
	Unit     string `json:"unit"`
	ItemRef  string `json:"item_ref"`

	DonationID uint     `json:"donation_id"`
	Donation   *Donation `gorm:"foreignKey:DonationID" json:"donation"`
}
