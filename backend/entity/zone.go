package entity

type Zone struct {
	ZoneID   uint   `gorm:"primarykey;autoIncrement" json:"zone_id"`
	ZoneName string `json:"zone_name"`
	KennelID uint   `json:"kennel_id"`           // Foreign key to Kennel
	Kennel   Kennel `gorm:"references:KennelID"` // Association to Kennel
}
