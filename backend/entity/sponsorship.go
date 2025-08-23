package entity

import (
	"time"
	"gorm.io/gorm"
)

type BillingInterval string
const (
	IntervalOneTime BillingInterval = "one_time"
	IntervalWeekly  BillingInterval = "weekly"
	IntervalMonthly BillingInterval = "monthly"
)

type SubscriptionMode string
const (
	ModeInstallment SubscriptionMode = "installment" // one-time รวมในนี้: total_cycles=1
	ModeRecurring   SubscriptionMode = "recurring"
)

type Sponsorship struct {
	gorm.Model

	SponsorID uint `gorm:"not null;index"`
	Sponsor   *Sponsor `gorm:"foreignKey:SponsorID"`
	DogID     uint `gorm:"not null;index"`
	Dog	   *Dog `gorm:"foreignKey:DogID"`

	Mode            SubscriptionMode `gorm:"type:text;not null"`
	BillingInterval BillingInterval  `gorm:"type:text;not null"`

	AmountPerCycle *int64 `json:"amount_per_cycle_satang,omitempty"`
	AmountTotal    *int64 `json:"amount_total_satang,omitempty"`

	TotalCycles   *int       `json:"total_cycles,omitempty"`
	BilledCycles  int        `json:"billed_cycles"`
	Status        string     `gorm:"type:text;not null;default:'active';index"`
	StartAt       time.Time  `json:"start_at"`
	NextBillingAt *time.Time `json:"next_billing_at,omitempty"`
}