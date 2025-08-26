package entity

import (
	"time"

	"gorm.io/gorm"
)

type Dog struct {
	gorm.Model
	Name        string `json:"name"`
	AnimalSexID uint `json:"animalSexID"`
	AnimalSex  *AnimalSex `gorm:"foreignKey:AnimalSexID"`
	DateOfBirth time.Time
	DateArrived time.Time
	SterilizedAt *time.Time  `json:"sterilized_at,omitempty"` // วันที่ทำหมัน (ถ้ามี)
	PhotoURL    string `json:"photo_url"`
	Character   string
	ReadyToAdopt bool
	IsAdopted   bool

	BreedID uint `json:"breed_id"`
	Breed   *Breed `gorm:"foreignKey:BreedID"`

	KennelID uint `json:"kennel_id"`
	Kennel   *Kennel `gorm:"foreignKey:KennelID"`


	
	MedicalRecords []MedicalRecord `gorm:"foreignKey:DogID"`
	Adoptions      []Adoption      `gorm:"foreignKey:DogID"`
	Sponsorships   []Sponsorship   `gorm:"foreignKey:DogID"`
}