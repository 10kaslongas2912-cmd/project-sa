package entity

import (
	"time"
	"gorm.io/gorm"
)

type Visit struct {
	gorm.Model
	VisitName 	string `json:"visit_name" gorm:"not null"`
	StartAt     time.Time  `json:"start_at" gorm:"not null"`
	EndAt       time.Time  `json:"end_at" gorm:"not null"`

	VisitDetails []VisitDetail `gorm:"foreignKey:VisitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"visit_details,omitempty"`
}