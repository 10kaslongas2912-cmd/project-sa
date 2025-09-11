package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedBuildings(db *gorm.DB) error {
	buildings := []entity.Building{
		{BuildingName: "ตึก A", Size: "small"},
		{BuildingName: "ตึก B", Size: "medium"},
		{BuildingName: "ตึก C", Size: "large"},
		{BuildingName: "ตึก D", Size: "medium"},
		{BuildingName: "ตึก E", Size: "small"},
	}

	for _, b := range buildings {
		// ใช้ db ที่ส่งเข้ามาเป็น parameter
		if err := db.FirstOrCreate(&b, entity.Building{BuildingName: b.BuildingName}).Error; err != nil {
			return err
		}
	}

	return nil
}
