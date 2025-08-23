package entity

import "gorm.io/gorm"

type SponsorKind string

const (
	SponsorKindUser      SponsorKind = "user"      // ผู้ใช้ในระบบ
	SponsorKindGuest     SponsorKind = "guest"     // บุคคลทั่วไป
	SponsorKindOrg       SponsorKind = "org"       // ในนามองค์กร/มูลนิธิ/บริษัท
	SponsorKindAnonymous SponsorKind = "anonymous" // ไม่เปิดเผยชื่อ
)

type Sponsor struct {
	gorm.Model

	Kind SponsorKind `gorm:"type:text;not null;index" json:"kind"`

	// ถ้าเป็นผู้ใช้ในระบบ ให้โยง UserID (1 user = 1 sponsor)
	UserID *uint `gorm:"uniqueIndex" json:"user_id,omitempty"`
	// User   *User  `json:"user,omitempty"` // มีค่อยเปิดใช้

	// ข้อมูลติดต่อ (กรณี guest/org/anonymous)
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Email     *string `gorm:"index:uniq_kind_email,unique" json:"email,omitempty"`
	Phone     *string `json:"phone,omitempty"`
	OrgName   *string `json:"org_name,omitempty"`
	GenderId  *uint   `json:"gender_id,omitempty"`
	Genders *Genders `gorm:"foreignKey:GenderId" json:"gender,omitempty"`

	// ใช้ทำกรอง/รายงาน
	Status string  `gorm:"type:text;not null;default:'active';index" json:"status"` // active/blocked
	Note   *string `gorm:"type:text" json:"note,omitempty"`

}
