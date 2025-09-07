package entity

import (
	"gorm.io/gorm"
	"time"
)

type Subscription struct {
	gorm.Model

	SponsorshipID uint         `json:"sponsorship_id"`
	Sponsorship   *Sponsorship `gorm:"foreignKey:SponsorshipID" json:"sponsorship"`

	Amount        int64      `json:"amount"` 
	Interval      string     `json:"interval"`  // เช่น "monthly", "quarterly", "annually"
	StartDate     time.Time  `json:"start_date"`
	CancelAt      *time.Time `json:"cancel_at"`
	Status        string     `json:"status"`

	SponsorshipPayments []SponsorshipPayment `gorm:"foreignKey:SubscriptionID" json:"sponsorship_payments"`
}