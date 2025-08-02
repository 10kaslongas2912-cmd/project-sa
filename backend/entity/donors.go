package entity

type Donors struct {
	DonorID   uint   `gorm:"primarykey;autoIncrement" json:"donor_id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	DonorType string `json:"donor_type"`
	
	UserID    uint   `json:"user_id"`
	Users      Users  `gorm:"foreignKey:UserID"`

	Donations []Donations `gorm:"foreignKey:DonorID"`
}
