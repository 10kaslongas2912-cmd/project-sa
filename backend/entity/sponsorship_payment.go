package entity

import (
	"time"

	"gorm.io/gorm"
)

type SponsorshipPayment struct {
	gorm.Model
	SponsorshipID    uint              `gorm:"not null;index"`
	CycleID          *uint             `gorm:"index"`
	SponsorshipCycle *SponsorshipCycle `gorm:"foreignKey:CycleID"`
	Amount           int64             `gorm:"not null"`
	PaymentType      string            `gorm:"size:20;not null"` // "card","promptpay","bank_transfer"
	Provider         string            `gorm:"size:20;not null"` // "mock"
	TransactionRef   string            `gorm:"size:50;unique"`
	Status           string            `gorm:"type:text;not null;default:'pending';index"`
	PaidAt           *time.Time
	FailureMsg       *string
}
