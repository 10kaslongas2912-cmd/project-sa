package seeds

import (
	"fmt"
	"time"

	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedDogs(db *gorm.DB) error {

	var sexMale, sexFemale entity.AnimalSex
	if err := db.Where("name = ?", "ตัวผู้").First(&sexMale).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ตัวเมีย").First(&sexFemale).Error; err != nil {
		return err
	}

	var sizeSmall, sizeMedium, sizeLarge entity.AnimalSize
	if err := db.Where("name = ?", "เล็ก").First(&sizeSmall).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "กลาง").First(&sizeMedium).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ใหญ่").First(&sizeLarge).Error; err != nil {
		return err
	}

	var golden, poodle, bulldog entity.Breed
	if err := db.Where("name = ?", "Golden Retriever").First(&golden).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Poodle").First(&poodle).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Bulldog").First(&bulldog).Error; err != nil {
		return err
	}

	var kenA, kenB entity.Kennel
	if err := db.Where("name = ?", "A-1").First(&kenA).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "B-1").First(&kenB).Error; err != nil {
		return err
	}

	
	dogs := []entity.Dog{
		{
			Name:          "Tor",
			AnimalSexID:   sexMale.ID,
			AnimalSizeID:  sizeSmall.ID,
			BreedID:       golden.ID,
			KennelID:      kenA.ID,
			DateOfBirth:   time.Date(2012, 8, 9, 0, 0, 0, 0, time.UTC),
			DateOfArrived: time.Date(2012, 12, 1, 0, 0, 0, 0, time.UTC),
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Playful",
			PhotoURL:      fmt.Sprintf("%s/static/images/dog/dog1.jpg", PublicBaseURL),
		},
		{
			Name:          "Taa",
			AnimalSexID:   sexFemale.ID,
			AnimalSizeID:  sizeMedium.ID,
			BreedID:       poodle.ID,
			KennelID:      kenB.ID,
			DateOfBirth:   time.Date(1995, 10, 9, 0, 0, 0, 0, time.UTC),
			DateOfArrived: time.Date(1999, 4, 9, 0, 0, 0, 0, time.UTC),
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Calm",
			PhotoURL:      fmt.Sprintf("%s/static/images/dog/dog2.jpg", PublicBaseURL),
		},
		{
			Name:          "Jia",
			AnimalSexID:   sexMale.ID,
			AnimalSizeID:  sizeLarge.ID,
			BreedID:       bulldog.ID,
			KennelID:      kenA.ID,
			DateOfBirth:   time.Date(2010, 12, 1, 0, 0, 0, 0, time.UTC),
			DateOfArrived: time.Date(2011, 10, 2, 0, 0, 0, 0, time.UTC),
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Energetic",
			PhotoURL:      fmt.Sprintf("%s/static/images/dog/dog3.jpg", PublicBaseURL),
		},
		{
			Name:          "Sam",
			AnimalSexID:   sexMale.ID,
			AnimalSizeID:  sizeLarge.ID,
			BreedID:       bulldog.ID,
			KennelID:      kenA.ID,
			DateOfBirth:   time.Date(2022, 12, 1, 0, 0, 0, 0, time.UTC),
			DateOfArrived: time.Date(2023, 10, 2, 0, 0, 0, 0, time.UTC),
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Energetic",
			PhotoURL:      fmt.Sprintf("%s/static/images/dog/dog5.jpg", PublicBaseURL),
		},
		{
			Name:          "Nam",
			AnimalSexID:   sexMale.ID,
			AnimalSizeID:  sizeLarge.ID,
			BreedID:       bulldog.ID,
			KennelID:      kenA.ID,
			DateOfBirth:   time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			DateOfArrived: time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Energetic",
			PhotoURL: fmt.Sprintf("%s/static/images/dog/dog6.jpg", PublicBaseURL),
		},
	}

	for i := range dogs {
		if err := db.Where("name = ?", dogs[i].Name).FirstOrCreate(&dogs[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
