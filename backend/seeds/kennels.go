package seeds

import (
	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
	"gorm.io/gorm"
)

func seedKennels(db *gorm.DB) error {
	var zoneA, zoneB entity.Zone
	if err := db.Where("name = ?", "A").First(&zoneA).Error; err != nil { return err }
	if err := db.Where("name = ?", "B").First(&zoneB).Error; err != nil { return err }

	kennels := []entity.Kennel{
		{Name: "A-1", ZoneID: zoneA.ID, Capacity: 10, Color: "Blue",  Note: pointer.P("ใกล้ทางเข้า")} ,
		{Name: "A-2", ZoneID: zoneA.ID, Capacity:  8, Color: "Cyan",  Note: pointer.P("เงียบสงบ")}   ,
		{Name: "B-1", ZoneID: zoneB.ID, Capacity:  8, Color: "Green", Note: pointer.P("พื้นที่เล่น")}, 
	}

	for i := range kennels {
		if err := db.
			Where("name = ?", kennels[i].Name).
			FirstOrCreate(&kennels[i]).Error; err != nil {
			return err
		}
	}
	return nil
}