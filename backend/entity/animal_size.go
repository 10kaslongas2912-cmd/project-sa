package entity

import "gorm.io/gorm"

type AnimalSize struct {
	gorm.Model
	Name string `json:"name"`
	Dogs []Dog `gorm:"foreignKey:AnimalSizeID" json:"dogs"`
}