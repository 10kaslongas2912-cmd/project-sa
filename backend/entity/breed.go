package entity

import "gorm.io/gorm"

type Breed struct {
	gorm.Model
	BreedName   string `json:"breed_name"`
	Description string `json:"description"`

	Dog []Dog `gorm:"foreignKey:BreedID"`
}
