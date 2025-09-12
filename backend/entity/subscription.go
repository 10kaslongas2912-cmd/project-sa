package entity

import (
	"time"

	"gorm.io/gorm"
)

type Subscription struct {
	gorm.Model

	SponsorshipID uint         `json:"sponsorship_id"`
	Sponsorship   *Sponsorship `gorm:"foreignKey:SponsorshipID" json:"sponsorship"`

	Amount            int64      `json:"amount"`
	Interval          string     `json:"interval"` // เช่น "monthly", "quarterly", "annually"
	StartDate         time.Time  `json:"start_date"`
	CancelAt          *time.Time `json:"cancel_at"`
	EndedAt           *time.Time `json:"ended_at"`
	CancelAtPeriodEnd bool       `json:"cancel_at_period_end"`
	Status            string     `json:"status"`
	NextPaymentAt     *time.Time `json:"next_payment_at"`

	SponsorshipPayments []SponsorshipPayment `gorm:"foreignKey:SubscriptionID" json:"sponsorship_payments"`
}
