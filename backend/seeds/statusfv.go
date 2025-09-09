// seeds/status_fv.go
package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedStatusFV(db *gorm.DB) error {
	statuses := []string{"pending", "approved", "rejected", "none"}

	for _, desc := range statuses {
		var s entity.StatusFV
		// Use Status as natural key to avoid duplicates
		if err := db.FirstOrCreate(&s, entity.StatusFV{Status: desc}).Error; err != nil {
			return err
		}
	}
	return nil
}
