package entity

import "gorm.io/gorm"

type SponsorKind string

const (
	SponsorKindUser      SponsorKind = "user"      // ผู้ใช้ในระบบ
	SponsorKindGuest     SponsorKind = "guest"     // บุคคลทั่วไป
)

type Sponsor struct {
	gorm.Model

	Kind SponsorKind `gorm:"type:text;not null;index" json:"kind"`

	// ถ้าเป็นผู้ใช้ในระบบ ให้โยง UserID (1 user = 1 sponsor)
	UserID *uint `gorm:"uniqueIndex" json:"user_id"`
	User   *User `gorm:"foreignKey:UserID" json:"user"`
	// ข้อมูลติดต่อ (กรณี guest)
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Email     *string `gorm:"index;uniqueIndex:uniq_kind_email" json:"email"`
	Phone     *string `json:"phone"`
	GenderID  *uint   `json:"gender_id"`
	Gender *Gender `gorm:"foreignKey:GenderID" json:"gender"`

	// ใช้ทำกรอง/รายงาน
	Note   *string `gorm:"type:text" json:"note"`

	Sponsorships []Sponsorship `gorm:"foreignKey:SponsorID" json:"sponsorships"`
}
