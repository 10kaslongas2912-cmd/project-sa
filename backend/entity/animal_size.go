package entity

import "gorm.io/gorm"

type AnimalSize struct {
	gorm.Model
	AnimalSize string `json:"animal_size"`
	Dogs []Dog `gorm:"foreignKey:AnimalSizeID"`
}