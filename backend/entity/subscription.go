package entity

import (
	"gorm.io/gorm"
)

type Subscription struct {
	gorm.Model
	SponsorshipID  uint        `json:"sponsorship_id"`
	Sponsorship    *Sponsorship `gorm:"foreignKey:SponsorshipID" json:"sponsorship"`

	Amount   int64       `json:"amount"`
	Interval       string      `json:"interval"`        // DAY, WEEK, MONTH, YEAR
	IntervalCount  int         `json:"interval_count"`  // เช่น ทุก 1 เดือน
	StartDate      string      `json:"start_date"`
	CancelAt       *string     `json:"cancel_at"`
	Status         string      `json:"status"`          // ACTIVE, PAUSED, CANCELED, INCOMPLETE

	SponsorshipPayments []SponsorshipPayment `gorm:"foreignKey:SubscriptionID" json:"sponsorship_payments"`
}