package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedDogPersonalities(db *gorm.DB) error {
	dog_personalities := []entity.DogPersonality{
		{
			DogID: 1,
			PersonalityID: 1,
		},
		{
			DogID: 1,
			PersonalityID: 2,
		},
		{
			DogID: 1,
			PersonalityID: 3,
		},
		{
			DogID: 1,
			PersonalityID: 4,
		},
		{
			DogID: 1,
			PersonalityID: 5,
		},
		{
			DogID: 1,
			PersonalityID: 6,
		},
		{
			DogID: 2,
			PersonalityID: 1,
		},
		{
			DogID: 2,
			PersonalityID: 2,
		},
		{
			DogID: 2,
			PersonalityID: 3,
		},
		{
			DogID: 2,
			PersonalityID: 4,
		},
		{
			DogID: 2,
			PersonalityID: 5,
		},
		{
			DogID: 2,
			PersonalityID: 6,
		},
		{
			DogID: 3,
			PersonalityID: 1,
		},
		{
			DogID: 3,
			PersonalityID: 2,
		},
	}

	for i := range dog_personalities {
		if err := db.Create(&dog_personalities[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
