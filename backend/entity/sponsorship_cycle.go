package entity

import (
	"time"

	"gorm.io/gorm"
)

type SponsorshipCycle struct {
	gorm.Model
	SponsorshipID        uint         `gorm:"not null;index"`
	Sponsorship          *Sponsorship `gorm:"foreignKey:SponsorshipID"`
	Seq                  int          `gorm:"not null;index"`
	DueAt                time.Time    `gorm:"not null"`
	Amount               int64        `gorm:"not null"`
	Status               string       `gorm:"type:text;not null;default:'scheduled';index"`
	SponsorshipPaymentID *uint
	SponsorshipPayment   *SponsorshipPayment `gorm:"foreignKey:SponsorshipPaymentID"`
}
