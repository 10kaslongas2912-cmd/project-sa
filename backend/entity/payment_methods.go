package entity

type PaymentMethods struct {
	PaymentID uint   `gorm:"primarykey;autoIncrement" json:"payment_id"`
	Name      string `json:"name"`

	MoneyDonations []MoneyDonations `gorm:"foreignKey:PaymentID"`
}
