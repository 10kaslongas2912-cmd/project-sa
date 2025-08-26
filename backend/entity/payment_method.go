package entity

import "gorm.io/gorm"

type PaymentMethod struct {
	gorm.Model
	Name string `json:"name"`

	MoneyDonations []MoneyDonation `gorm:"foreignKey:PaymentMethodID"`
	Sponsorships   []Sponsorship   `gorm:"foreignKey:PaymentMethodID"`
}
