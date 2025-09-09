package entity

import "gorm.io/gorm"

type PaymentMethod struct {
	gorm.Model
	Code string `json:"code"`
	Name string `json:"name"`

	MoneyDonations []MoneyDonation `gorm:"foreignKey:PaymentMethodID" json:"money_donations"`
	SponsorshipPayments   []SponsorshipPayment   `gorm:"foreignKey:PaymentMethodID" json:"sponsorrship_payments"`

}
