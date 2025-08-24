package entity

type KennelManagement struct {
	Kennels uint
	Kennel  *uint `gorm:"references:KennelID"`

	StaffID uint
	Staffs  *uint `gorm:"foreignkey:StaffID;"`
}
