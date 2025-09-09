package entity

import (
	"time"
	"gorm.io/gorm"
)

type Visit struct {
	gorm.Model
	VisitName 	string `json:"visit_name"`
	StartAt     time.Time  `json:"start_at"`
	EndAt       time.Time  `json:"end_at"`

	

	VisitDetails []VisitDetail `gorm:"foreignKey:VisitID" json:"visit_details"`

}