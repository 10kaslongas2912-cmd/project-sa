package entity

import "gorm.io/gorm"

// Unit represents a unit of measurement for an item.
type Unit struct {
	gorm.Model
	Name string `gorm:"unique;not null" json:"name"`

	ItemDonations []ItemDonation `gorm:"foreignKey:UnitID" json:"item_donations"`
}
