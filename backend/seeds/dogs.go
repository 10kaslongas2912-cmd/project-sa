package seeds

import (
	"fmt"

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
			DateOfBirth:   "2012-08-09",
			DateOfArrived: "2012-12-01",
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
			DateOfBirth:   "1995-10-09",
			DateOfArrived: "1999-04-09",
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
			DateOfBirth:   "2010-12-01",
			DateOfArrived: "2011-10-02",
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
			DateOfBirth:   "2022-12-01",
			DateOfArrived: "2023-10-02",
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
			DateOfBirth:   "2025-01-01",
			DateOfArrived: "2025-01-02",
			IsAdopted:     false,
			ReadyToAdopt:  true,
			Character:     "Energetic",
			PhotoURL:      fmt.Sprintf("%s/static/images/dog/dog6.jpg", PublicBaseURL),
		},
	}

	for i := range dogs {
		if err := db.Where("name = ?", dogs[i].Name).FirstOrCreate(&dogs[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
