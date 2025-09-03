package entity

import (
	"gorm.io/gorm"
)

type MoneyDonation struct {
	gorm.Model
	Amount          float64 `json:"amount"`
	PaymentType     string  `json:"payment_type"`
	NextPaymentDate string  `json:"next_payment_date"`
	BillingDate     string  `json:"billing_date"`
	TransactionRef  string  `json:"transaction_ref"`
	Status          string  `json:"status"`

	DonationID uint     `json:"donation_id"`
	Donation   Donation `gorm:"foreignKey:DonationID"`

	PaymentMethodID uint           `json:"payment_method_id"`
	PaymentMethod   *PaymentMethod `gorm:"foreignKey:PaymentMethodID"`
}
