// entity/dog_personality.go
package entity

import "gorm.io/gorm"

type DogPersonality struct {
	gorm.Model
	DogID         uint         `json:"dog_id"         gorm:"uniqueIndex:dog_personality_unique"`
	Dog           *Dog         `json:"dog"            gorm:"foreignKey:DogID"`
	PersonalityID uint         `json:"personality_id" gorm:"uniqueIndex:dog_personality_unique"`
	Personality   *Personality `json:"personality"    gorm:"foreignKey:PersonalityID"`
}
