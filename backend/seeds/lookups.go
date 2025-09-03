package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedLookupsBase(db *gorm.DB) error {
	if err := db.Where("name = ?", "ชาย").
		FirstOrCreate(&entity.Gender{Name: "ชาย"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "หญิง").
		FirstOrCreate(&entity.Gender{Name: "หญิง"}).Error; err != nil {
		return err
	}

	if err := db.Where("name = ?", "Handler").
		FirstOrCreate(&entity.Role{Name: "Handler"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Manager").
		FirstOrCreate(&entity.Role{Name: "Manager"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "Medician").
		FirstOrCreate(&entity.Role{Name: "Medician"}).Error; err != nil {
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

	if err := db.Where("name = ?", "บัตรเครดิต").
		FirstOrCreate(&entity.PaymentMethod{Name: "บัตรเครดิต"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "โอนเงินผ่านธนาคาร").
		FirstOrCreate(&entity.PaymentMethod{Name: "โอนเงินผ่านธนาคาร"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "พร้อมเพย์").
		FirstOrCreate(&entity.PaymentMethod{Name: "พร้อมเพย์"}).Error; err != nil {
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

	if err := db.Where("name = ?", "A").
		FirstOrCreate(&entity.Zone{ZoneName: "A"}).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "B").
		FirstOrCreate(&entity.Zone{ZoneName: "B"}).Error; err != nil {
		return err
	}

	return nil
}
