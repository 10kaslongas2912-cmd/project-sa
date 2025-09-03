package entity

import (
	"gorm.io/gorm"
)

type Adopter struct {
	gorm.Model
	Address	 string `json:"address"`
	Job   string `json:"job"`
	AnnulIncome uint `json:"annual_income"`
	UserID uint `json:"user_id"`
	User  *User `gorm:"foreignKey:UserID"`

	Adoptions []Adoption `gorm:"foreignKey:AdopterID"`
}