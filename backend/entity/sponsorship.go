package entity

import (
	"gorm.io/gorm"
)

type Sponsorship struct {
	gorm.Model
	SponsorID uint     `json:"sponsor_id"`
	Sponsor   *Sponsor `gorm:"foreignKey:SponsorID" json:"sponsor"`
	DogID     uint     `json:"dog_id"`
	Dog       *Dog     `gorm:"foreignKey:DogID" json:"dog"`

	PlanType string `json:"plan_type"`
	Amount   int64 `json:"amount"`
	Status   *string `json:"status"` // PENDING, ACTIVE, COMPLETED, CANCELED
	Note     *string `json:"note"`

	Enabled   bool `json:"enabled"`
	Channel   *string `json:"channel"`
	Frequency *string `json:"frequency"`

	// กำหนดความสัมพันธ์ 1-1 กับ Subscription
	// GORM จะสร้าง foreign key `sponsorship_id` ในตาราง `subscriptions`
	// `constraint:OnDelete:CASCADE` จะลบ Subscription ที่เกี่ยวข้องโดยอัตโนมัติเมื่อ Sponsorship ถูกลบ
	Subscription *Subscription `gorm:"constraint:OnDelete:CASCADE;" json:"subscription"`

	SponsorshipPayments []SponsorshipPayment `gorm:"foreignKey:SponsorshipID" json:"sponsorship_payments"`
}