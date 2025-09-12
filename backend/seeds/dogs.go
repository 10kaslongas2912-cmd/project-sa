package seeds

import (
	"fmt"

	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
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

	var wichai, kiti entity.Staff
	if err := db.Where("username = ?", "wichai").First(&wichai).Error; err != nil {
		return err
	}
	if err := db.Where("username = ?", "kittisak").First(&kiti).Error; err != nil {
		return err
	}
	dogs := []entity.Dog{
		{
			Name:         "Tor",
			AnimalSexID:  sexMale.ID,
			AnimalSizeID: sizeSmall.ID,
			BreedID:      golden.ID,
			KennelID:     pointer.P(kenA.ID),
			DateOfBirth:  "2020-02-14",
			IsAdopted:    false,
			ReadyToAdopt: true,
			PhotoURL:     fmt.Sprintf("%s/static/images/dog/dog1.jpg", PublicBaseURL),
			CreatedByID:  pointer.P(wichai.ID),
		},
		{
			Name:         "Taa",
			AnimalSexID:  sexFemale.ID,
			AnimalSizeID: sizeMedium.ID,
			BreedID:      poodle.ID,
			KennelID:     pointer.P(kenB.ID),
			DateOfBirth:  "2020-02-14",
			IsAdopted:    false,
			ReadyToAdopt: true,
			PhotoURL:     fmt.Sprintf("%s/static/images/dog/dog2.jpg", PublicBaseURL),
			CreatedByID:  pointer.P(wichai.ID),
		},
		{
			Name:         "Jia",
			AnimalSexID:  sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			BreedID:      bulldog.ID,
			KennelID:     pointer.P(kenA.ID),
			DateOfBirth:  "2020-02-14",
			IsAdopted:    false,
			ReadyToAdopt: true,
			PhotoURL:     fmt.Sprintf("%s/static/images/dog/dog3.jpg", PublicBaseURL),
			CreatedByID:  pointer.P(wichai.ID),
		},
		{
			Name:         "Sam",
			AnimalSexID:  sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			BreedID:      bulldog.ID,
			KennelID:     pointer.P(kenA.ID),
			DateOfBirth:  "2020-02-14",
			IsAdopted:    false,
			ReadyToAdopt: true,
			PhotoURL:     fmt.Sprintf("%s/static/images/dog/dog5.jpg", PublicBaseURL),
			CreatedByID:  pointer.P(wichai.ID),
		},
		{
			Name:         "Nam",
			AnimalSexID:  sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			BreedID:      bulldog.ID,
			KennelID:     pointer.P(kenA.ID),
			DateOfBirth:  "2020-02-14",
			IsAdopted:    false,
			ReadyToAdopt: true,
			PhotoURL:     fmt.Sprintf("%s/static/images/dog/dog6.jpg", PublicBaseURL),
			CreatedByID:  pointer.P(wichai.ID),
		},
	}

	for i := range dogs {
		if err := db.Where("name = ?", dogs[i].Name).FirstOrCreate(&dogs[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
