package seeds

import (
	"fmt"

	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
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
			Firstname:   "ศิริเดช",
			Lastname:    "สุภาพ",
			DateOfBirth: "1990-01-01",
			Email:       "nam@example.com",
			Phone:       "0800000000",
			Username:    "Nam",
			Password:    pw,
			GenderID:    male.ID,
			PhotoURL:    pointer.P(fmt.Sprintf("%s/static/images/user_profile/profile1.jpg", PublicBaseURL)),
		},
		{
			Firstname:   "รับเช็ค",
			Lastname:    "อึ่งชัยภูมิ",
			DateOfBirth: "1995-09-20",
			Email:       "ta@example.com",
			Phone:       "0898765432",
			Username:    "Ta",
			Password:    pw,
			GenderID:    male.ID,
			PhotoURL:    pointer.P(fmt.Sprintf("%s/static/images/user_profile/profile2.jpg", PublicBaseURL)),
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
