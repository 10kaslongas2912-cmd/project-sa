package entity

import "gorm.io/gorm"

type Personality struct {
	gorm.Model
	Name string `json:"name"`

	DogPersonalities []DogPersonality `gorm:"foreignKey:PersonalityID" json:"dog_personalities"`
}
