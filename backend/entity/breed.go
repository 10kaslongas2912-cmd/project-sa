package entity

import "gorm.io/gorm"

type Breed struct {
	gorm.Model
	Name   string `json:"name"`
	Description string `json:"description"`

	Dogs []Dog `gorm:"foreignKey:BreedID" json:"dogs"`
}
