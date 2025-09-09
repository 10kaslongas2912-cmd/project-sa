package entity

import (
	"gorm.io/gorm"
)

type AnimalSex struct {
	gorm.Model
	Name string `json:"name"`

	Dogs []Dog `gorm:"foreignKey:AnimalSexID" json:"dogs"`
}