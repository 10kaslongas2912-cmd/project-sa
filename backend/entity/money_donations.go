package entity

import "time"

type MoneyDonations struct {
	MoneyID         uint      `gorm:"primarykey;autoIncrement" json:"money_id"`
	Amount          float64   `json:"amount"`
	PaymentMethod   string    `json:"payment_method"`
	PaymentType     string    `json:"payment_type"`
	NextPaymentDate time.Time `json:"next_payment_date"`
	TransactionRef  string    `json:"transaction_ref"`
	Status          string    `json:"status"`

	DonationID      uint      `json:"donation_id"`
	Donation        Donations `gorm:"foreignKey:DonationID"`
	
	PaymentID       uint      `json:"payment_id"`
	Payment         PaymentMethods `gorm:"foreignKey:PaymentID"`
}
