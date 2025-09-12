package entity

import "gorm.io/gorm"

type ItemDonation struct {
	gorm.Model
	Quantity int    `json:"quantity"`
	ItemRef  string `json:"item_ref"`

	DonationID uint      `json:"donation_id"`
	Donation   *Donation `gorm:"foreignKey:DonationID" json:"donation"`

	ItemID uint  `json:"item_id"`
	Item   *Item `gorm:"foreignKey:ItemID" json:"item"`

	UnitID uint  `json:"unit_id"`
	Unit   *Unit `gorm:"foreignKey:UnitID" json:"unit"`
}
