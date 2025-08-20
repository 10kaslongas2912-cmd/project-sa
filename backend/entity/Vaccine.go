package entity

type Vaccine struct {
	VaccineID   uint   `gorm:"primarykey;autoIncrement" json:"vaccine_id"`
	Name        string `json:"name"`
	Manufacturer string `json:"manufacturer"`

	VaccineRecord []VaccineRecord `gorm:"foreignKey:VaccineID"`
}