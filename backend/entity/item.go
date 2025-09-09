package entity

import "gorm.io/gorm"

// Item represents a type of donatable item.
type Item struct {
	gorm.Model
	Name string `gorm:"unique;not null" json:"name"`

	ItemDonations []ItemDonation `gorm:"foreignKey:ItemID" json:"item_donations"`
}
