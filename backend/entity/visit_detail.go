package entity

import (
	"gorm.io/gorm"
)

type VisitDetail struct {
	gorm.Model
	
	VisitID uint  `json:"visit_id"` // Foreign key for Visit
	Visit   *Visit `gorm:"foreignKey:VisitID" json:"visit"` // Association to Visit

	DogID uint  `json:"dog_id"` // Foreign key for Dog
	Dog   *Dog `gorm:"foreignKey:DogID" json:"dog"` // Association to Dog
}