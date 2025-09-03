package entity

import (
	"gorm.io/gorm"
)

type Dog struct {
	gorm.Model
	Name        string `json:"name"`
	DateOfBirth string `json:"date_of_birth"`
	DateOfArrived string `json:"date_of_arrived"`
	SterilizedAt string  `json:"sterilized_at"` // วันที่ทำหมัน (ถ้ามี)
	PhotoURL    string `json:"photo_url"`
	Character   string `json:"character"`
	ReadyToAdopt bool `json:"ready_to_adopt"`
	IsAdopted   bool `json:"is_adopted"`
	
	BreedID uint `json:"breed_id"`
	Breed   *Breed `gorm:"foreignKey:BreedID"`
	
	KennelID uint `json:"kennel_id"`
	Kennel   *Kennel `gorm:"foreignKey:KennelID"`

	AnimalSexID uint `json:"animal_sex_id"`
	AnimalSex  *AnimalSex `json:"animal_sex" gorm:"foreignKey:AnimalSexID"`
	
	AnimalSizeID uint `json:"animal_size_id"`
	AnimalSize *AnimalSize `json:"animal_size" gorm:"foreignKey:AnimalSizeID"`

	MedicalRecords []MedicalRecord `gorm:"foreignKey:DogID"`
	Adoptions      []Adoption      `gorm:"foreignKey:DogID"`
	Sponsorships   []Sponsorship   `gorm:"foreignKey:DogID"`
}