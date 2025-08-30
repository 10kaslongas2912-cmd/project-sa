package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedUsers(db *gorm.DB) error {

	var male, female entity.Gender
	if err := db.Where("name = ?", "ชาย").First(&male).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "หญิง").First(&female).Error; err != nil {
		return err
	}

	users := []entity.User{
		{
			Firstname:   "Admin",
			Lastname:    "Root",
			DateOfBirth: "1990-01-01",
			Email:       "admin@example.com",
			Phone:       "0800000000",
			Username:    "Nam",
			Password:    pw,
			GenderID:    male.ID,
		},
		{
			Firstname:   "สมหญิง",
			Lastname:    "มีใจ",
			DateOfBirth: "1995-09-20",
			Email:       "adopter@example.com",
			Phone:       "0898765432",
			Username:    "tor",
			Password:    pw,
			GenderID:    female.ID,
		},
	}

	for i := range users {
		if err := db.
			Where("username = ?", users[i].Username).
			FirstOrCreate(&users[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
