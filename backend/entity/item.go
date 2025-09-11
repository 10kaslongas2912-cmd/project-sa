package entity

import "gorm.io/gorm"


type Item struct {
	gorm.Model
	Name string `gorm:"unique;not null" json:"name"`

	ItemDonations []ItemDonation `gorm:"foreignKey:ItemID" json:"item_donations"`
}
