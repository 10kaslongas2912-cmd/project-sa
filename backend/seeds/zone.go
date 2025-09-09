package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedZones(db *gorm.DB) error {
	zones := []entity.Zone{
		{Name: "A"},
		{Name: "B"},
	}

	for i := range zones {
		if err := db.Where("name = ?", zones[i].Name).FirstOrCreate(&zones[i]).Error; err != nil {
			return err
		}
	}

	return nil
}
