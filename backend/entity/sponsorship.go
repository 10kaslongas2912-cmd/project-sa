package entity

import (
	"time"

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

	SponsorID uint     `gorm:"not null;index"`
	Sponsor   *Sponsor `gorm:"foreignKey:SponsorID"`
	DogID     uint     `gorm:"not null;index"`
	Dog       *Dog     `gorm:"foreignKey:DogID"`

	PaymentMode     PaymentMode     `gorm:"type:text;not null"`
	BillingInterval BillingInterval `gorm:"type:text;not null"`

	AmountPerCycle *int64 `json:"amount_per_cycle"`
	AmountTotal    *int64 `json:"amount_total_satang"`

	PaymentMethodID uint           `json:"payment_method_id"`
	PaymentMethod   *PaymentMethod `gorm:"foreignKey:PaymentMethodID"`

	BilledCycles int `json:"billed_cycles"`

	Status        string     `gorm:"type:text;not null;default:'active';index"`
	StartAt       time.Time  `json:"start_at"`
	NextBillingAt *time.Time `json:"next_billing_at"`

	PausedAt   *time.Time `json:"paused_at"`
	CanceledAt *time.Time `json:"canceled_at"`
}
