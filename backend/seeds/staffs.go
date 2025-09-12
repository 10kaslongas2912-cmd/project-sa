package seeds

import (
	"fmt"

	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
	"gorm.io/gorm"
)

func seedStaffs(db *gorm.DB) error {

	var male, female entity.Gender
	if err := db.Where("name = ?", "ชาย").First(&male).Error; err != nil {
		return fmt.Errorf("seedStaff: gender ชาย not found: %w", err)
	}
	if err := db.Where("name = ?", "หญิง").First(&female).Error; err != nil {
		return fmt.Errorf("seedStaff: gender หญิง not found: %w", err)
	}

	var zoneA, zoneB entity.Zone
	if err := db.Where("name = ?", "A").First(&zoneA).Error; err != nil {
		return fmt.Errorf("seedStaff: zone A not found: %w", err)
	}
	if err := db.Where("name = ?", "B").First(&zoneB).Error; err != nil {
		return fmt.Errorf("seedStaff: zone B not found: %w", err)
	}

	active := "active"

	staffs := []entity.Staff{
		{
			FirstName:   "Wichai",
			LastName:    "Srisuruk",
			Username:    "wichai",
			Password:    pw,
			GenderID:    female.ID,
			DateOfBirth: "1992-06-25",
			Phone:       "0880088000",
			Email:       "wichi@example.com",
			Status:      &active,
			PhotoURL:    pointer.P(fmt.Sprintf("%s/static/images/staff_profile/staff1.png", PublicBaseURL)),
			Note:        pointer.P("Ops manager"),
			ZoneID:      zoneB.ID,
		},
		{
			FirstName:   "Kittisak",
			LastName:    "Kerdprasop",
			Username:    "kittisak",
			Password:    pw,
			GenderID:    female.ID,
			DateOfBirth: "1992-06-25",
			Phone:       "0999999999",
			Email:       "kittisak@example.com",
			Status:      &active,
			PhotoURL:    pointer.P(fmt.Sprintf("%s/static/images/staff_profile/staff2.png", PublicBaseURL)),
			Note:        pointer.P("Ops manager"),
			ZoneID:      zoneB.ID,
		},

	}

	for i := range staffs {
		if err := db.Where("username = ?", staffs[i].Username).
			FirstOrCreate(&staffs[i]).Error; err != nil {
			return err
		}
	}
	return nil
}
