package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

// Call this from SeedAll(db)
func seedSkills(db *gorm.DB) error {
	descs := []string{"การดูแลสุนัข", "การฝึกสุนัข", "การจัดการเหตุฉุกเฉิน", "การสื่อสารและการประชาสัมพันธ์", "อื่นๆ"}
	for _, d := range descs {
		if err := db.FirstOrCreate(&entity.Skill{}, entity.Skill{Description: d}).Error; err != nil {
			return err
		}
	}
	return nil
}
