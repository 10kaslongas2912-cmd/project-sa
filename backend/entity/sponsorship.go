package entity

import (

	"gorm.io/gorm"
)

type BillingInterval string

const (
	IntervalOneTime   BillingInterval = "one_time"
	IntervalQuarterly BillingInterval = "quarterly"
	IntervalMonthly   BillingInterval = "monthly"
	IntervalYearly    BillingInterval = "yearly"
)

type PaymentMode string

const (
	ModeOneTime   PaymentMode = "one_time"
	ModeRecurring PaymentMode = "recurring"
)

type Sponsorship struct {
	gorm.Model
	SponsorID uint             `json:"sponsor_id"`
	Sponsor   *Sponsor  `gorm:"foreignKey:SponsorID" json:"sponsor"`
	DogID            uint             `json:"dog_id"`
	Kind             string           `json:"kind"`   // ONE_TIME / SUBSCRIPTION
	Status           string           `json:"status"` // PENDING, ACTIVE, COMPLETED, CANCELED
	Note             *string          `json:"note"`

	Subscription *Subscription `json:"subscription"`
	SponsorshipPayments     []SponsorshipPayment     `gorm:"foreignKey:SponsorshipID" json:"sponsorship_payments"`
}

