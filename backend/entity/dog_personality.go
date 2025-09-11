// entity/dog_personality.go
package entity

import "gorm.io/gorm"

type DogPersonality struct {
	gorm.Model
	DogID         uint         `json:"dog_id"`
	Dog           *Dog         `json:"dog"            gorm:"foreignKey:DogID"`
	PersonalityID uint         `json:"personality_id"`
	Personality   *Personality `json:"personality"    gorm:"foreignKey:PersonalityID"`
}
