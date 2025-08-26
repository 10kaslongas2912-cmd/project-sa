package entity

import (
	"gorm.io/gorm"
)

type AnimalSex struct {
	gorm.Model
	AnimalSex string `json:"animal_sex"`

	Dogs []Dog `gorm:"foreignKey:AnimalSexID"`
}