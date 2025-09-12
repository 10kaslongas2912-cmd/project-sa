package entity

type KennelManagement struct {
	KennelID uint
	Kennel   *Kennel `gorm:"foreignKey:KennelID"`
	DogID    uint
	Dog      *Dog `gorm:"foreignKey:DogID"`
	StaffID  uint
	Staff    *Staff `gorm:"foreignKey:StaffID"`
	Action   string `gorm:"not null"`
}
