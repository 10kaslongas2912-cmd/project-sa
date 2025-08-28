package dbutil

import "gorm.io/gorm"

// ใช้กับ list card
func ScopeDogCard(db *gorm.DB) *gorm.DB {
	return db.Preload("AnimalSex")
}

// ใช้กับรายละเอียด
func ScopeDogDetail(db *gorm.DB) *gorm.DB {
	return db.Preload("AnimalSex").Preload("Breed").Preload("Kennel")
}
