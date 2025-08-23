package entity

import "time"

type MoneyDonations struct {
	MoneyID         uint      `gorm:"primarykey;autoIncrement" json:"money_id"`
	Amount          float64   `json:"amount"`
	PaymentType     string    `json:"payment_type"`
	NextPaymentDate time.Time `json:"next_payment_date"`
	BillingDate     string    `json:"billing_date"`
	TransactionRef  string    `json:"transaction_ref"`
	Status          string    `json:"status"`

	DonationID      uint      `json:"donation_id"`
	Donation        Donations `gorm:"foreignKey:DonationID"`
	
	PaymentMethodID uint           `json:"payment_method_id"`
	PaymentMethod   PaymentMethods `gorm:"foreignKey:PaymentMethodID"`
}
