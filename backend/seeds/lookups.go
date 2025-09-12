package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedLookupsBase(db *gorm.DB) error {
	if err := db.Where("code = ?", "M").
		FirstOrCreate(&entity.Gender{Code: "M", Name: "ชาย"}).Error; err != nil {
		return err
	}
	if err := db.Where("code = ?", "F").
		FirstOrCreate(&entity.Gender{Code: "F", Name: "หญิง"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ตัวผู้").
		FirstOrCreate(&entity.AnimalSex{Name: "ตัวผู้"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ตัวเมีย").
		FirstOrCreate(&entity.AnimalSex{Name: "ตัวเมีย"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ไม่ทราบ").
		FirstOrCreate(&entity.AnimalSex{Name: "ไม่ทราบ"}).Error; err != nil {
		return err
	}

	if err := db.Where("name = ?", "เล็ก").
		FirstOrCreate(&entity.AnimalSize{Name: "เล็ก"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "กลาง").
		FirstOrCreate(&entity.AnimalSize{Name: "กลาง"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "ใหญ่").
		FirstOrCreate(&entity.AnimalSize{Name: "ใหญ่"}).Error; err != nil {
		return err
	}

	personalities := []entity.Personality{
		{Name: "ชอบผจญภัย"},
		{Name: "ชอบเรียนรู้สิ่งใหม่ ๆ"},
		{Name: "มั่นใจในตนเอง"},
		{Name: "สงบ"},
		{Name: "เข้ากับคนอื่นง่าย"},
		{Name: "เป็นมิตร"},
	}

	for i := range personalities {
		if err := db.Where("name = ?", personalities[i].Name).FirstOrCreate(&personalities[i]).Error; err != nil {
			return err
		}
	}

	if err := db.Where("code = ?", "credit").
		FirstOrCreate(&entity.PaymentMethod{Code: "credit", Name: "บัตรเครดิต"}).Error; err != nil {
		return err
	}
	if err := db.Where("code = ?", "qr").
		FirstOrCreate(&entity.PaymentMethod{Code: "qr", Name: "พร้อมเพย์"}).Error; err != nil {
		return err
	}


	if err := db.Where("name = ?", "Golden Retriever").
		FirstOrCreate(&entity.Breed{Name: "Golden Retriever", Description: "a medium-to-large, muscular dog breed from Scotland known for its dense, lustrous golden coat, gentle and affectionate nature, and high intelligence"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Poodle").
		FirstOrCreate(&entity.Breed{Name: "Poodle", Description: "highly intelligent, active, and trainable water retriever dogs originating from Germany"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Bulldog").
		FirstOrCreate(&entity.Breed{Name: "Bulldog", Description: "stocky, medium-sized dogs known for their distinct appearance: a large, wrinkled, short-muzzled face, a protruding undershot jaw, and a short, fine-textured coat in various colors"}).Error; err != nil {
		return err
	}

	
	var zoneA entity.Zone
	if err := db.Where("name = ?", "A").
		FirstOrCreate(&zoneA, entity.Zone{Name: "A"}).Error; err != nil {
		return err
	}

	var zoneB entity.Zone
	if err := db.Where("name = ?", "B").
		FirstOrCreate(&zoneB, entity.Zone{Name: "B"}).Error; err != nil {
		return err
	}
	var kennel00 entity.Kennel
		if err := db.Where("name = ?", "00").
			FirstOrCreate(&kennel00, entity.Kennel{Name: "00", ZoneID: zoneA.ID}).Error; err != nil {
			return err
		}
	// Create kennels with proper zone associations
	if err := db.Where("name = ?", "A-1").
		FirstOrCreate(&entity.Kennel{
			Name:   "A-1",
			ZoneID: zoneA.ID,
		}).Error; err != nil {
		return err
	}

	if err := db.Where("name = ?", "B-1").
		FirstOrCreate(&entity.Kennel{
			Name:   "B-1",
			ZoneID: zoneB.ID,
		}).Error; err != nil {
		return err
	}

	items := []entity.Item{
		{Name: "ข้าว"},
		{Name: "อาหารเม็ดสุนัข"},
		{Name: "อาหารกระป๋อง"},
		{Name: "เสื้อผ้าสุนัข"},
		{Name: "ผ้าห่ม"},
		{Name: "ของเล่น"},
		{Name: "อุปกรณ์การเรียน"},
		{Name: "น้ำยาล้างมือ"},
		{Name: "น้ำยาถูพื้น"},
		{Name: "ถุงขยะ"},
	}

	for i := range items {
		if err := db.Where("name = ?", items[i].Name).FirstOrCreate(&items[i]).Error; err != nil {
			return err
		}
	}

	units := []entity.Unit{
		{Name: "กิโลกรัม"},
		{Name: "ชิ้น"},
		{Name: "กล่อง"},
		{Name: "ถุง"},
		{Name: "ขวด"},
		{Name: "แผ่น"},
		{Name: "ห่อ"},
		{Name: "แพ็ค"},
		{Name: "ลัง"},
		{Name: "ผืน"},
	}

	for i := range units {
		if err := db.Where("name = ?", units[i].Name).FirstOrCreate(&units[i]).Error; err != nil {
			return err
		}
	}

	return nil
}
