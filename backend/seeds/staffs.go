package seeds

import (
	"fmt"

	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
	"gorm.io/gorm"
)

func seedStaffs(db *gorm.DB) error {

	var handlerRole, managerRole, medicianRole entity.Role
	if err := db.Where("name = ?", "Handler").First(&handlerRole).Error; err != nil {
		return fmt.Errorf("seedStaff: role Handler not found: %w", err)
	}
	if err := db.Where("name = ?", "Manager").First(&managerRole).Error; err != nil {
		return fmt.Errorf("seedStaff: role Manager not found: %w", err)
	}
	if err := db.Where("name = ?", "Medician").First(&medicianRole).Error; err != nil {
		return fmt.Errorf("seedStaff: role Manager not found: %w", err)
	}

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
	onLeave := "on_leave"

	staffs := []entity.Staff{
		{
			Firstname:   "Pongsak",
			Lastname:    "Suwan",
			Username:    "manager1",
			Password:    pw, // bcrypt
			GenderID:    male.ID,
			RoleID:      managerRole.ID,
			DateOfBirth: "1990-02-10",
			Phone:       "0810000001",
			Email:       "manager1@example.com",
			Status:      &active,
			Note:        pointer.P("General manager"),
			ZoneID:      zoneA.ID,
		},
		{
			Firstname:   "Nattaya",
			Lastname:    "Chaiyasit",
			Username:    "manager2",
			Password:    pw,
			GenderID:    female.ID,
			RoleID:      managerRole.ID,
			DateOfBirth: "1992-06-25",
			Phone:       "0810000002",
			Email:       "manager2@example.com",
			Status:      &onLeave,
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
