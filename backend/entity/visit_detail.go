package entity

import (
	"gorm.io/gorm"
)

type VisitDetail struct {
	gorm.Model
	
	VisitID uint  `json:"visit_id" gorm:"not null;index:idx_visit_dog,unique"` 
	Visit   *Visit `gorm:"foreignKey:VisitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"visit,omitempty"` 

	DogID uint  `json:"dog_id" gorm:"not null;index:idx_visit_dog,unique"` 
	Dog   *Dog `gorm:"foreignKey:DogID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"dog"` 
}