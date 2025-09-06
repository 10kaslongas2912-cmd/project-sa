package entity

import (

	"gorm.io/gorm"
)

type SponsorshipPayment struct {
	gorm.Model
	SponsorshipID   uint            `json:"sponsorship_id"`
	Sponsorship     *Sponsorship    `gorm:"foreignKey:SponsorshipID" json:"sponsorship"`

	SubscriptionID  *uint           `json:"subscription_id"`
	Subscription    *Subscription   `gorm:"foreignKey:SubscriptionID" json:"subscription"`

	PaymentMethodID uint            `json:"payment_method_id"`
	PaymentMethod   *PaymentMethod  `gorm:"foreignKey:PaymentMethodID" json:"payment_method"`
	
	Amount     int64           `json:"amount"`
	Status          string          `json:"status"`   // PENDING, SUCCEEDED, FAILED, REFUNDED
}
