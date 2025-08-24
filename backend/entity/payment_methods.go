package entity

type PaymentMethods struct {
	PaymentID uint   `gorm:"primaryKey;autoIncrement" json:"payment_id"`
	Name      string `json:"name"`
}