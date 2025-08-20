package entity

import (
	"time"

)

type Dog struct {
	DogID      uint `gorm:"primarykey;autoIncrement" json:"dog_id"`
	Name        string
	Gender      string
	DateOfBirth time.Time
	DateArrived time.Time
	IsAdopted   bool
	PhotoURL    string
	Character   string

	BreedID uint `json:"breed_id"`
	Breed   Breed `gorm:"foreignKey:BreedID"`

	KennelID uint `json:"kennel_id"`
	Kennel   Kennel `gorm:"foreignKey:KennelID"`
	
	MedicalRecords []MedicalRecord `gorm:"foreignKey:DogID"`
}