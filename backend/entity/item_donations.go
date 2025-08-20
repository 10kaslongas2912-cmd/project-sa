package entity

type ItemDonations struct {
	ItemID     uint      `gorm:"primarykey;autoIncrement" json:"item_id"`
	ItemName   string    `json:"item_name"`
	Quantity   int       `json:"quantity"`
	Unit       string    `json:"unit"`
	ItemRef    string    `json:"item_ref"`
	
	DonationID uint      `json:"donation_id"`
	Donation   Donations `gorm:"foreignKey:DonationID"`
}
