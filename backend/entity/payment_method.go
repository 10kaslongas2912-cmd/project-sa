package entity

import "gorm.io/gorm"

type PaymentMethod struct {
	gorm.Model
	Name string `json:"name"`

	MoneyDonations []MoneyDonation `gorm:"foreignKey:PaymentMethodID"`
	SponsorshipPayments   []SponsorshipPayment   `gorm:"foreignKey:PaymentMethodID"`
}
