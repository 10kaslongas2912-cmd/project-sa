package entity

import (
	"time"

	"gorm.io/gorm"
)

type Manage struct {
	gorm.Model
	DateTask	time.Time
	
	TypeTask	string	`json:"type_task" gorm:"not null"`
	DetailTask	string	`json:"detail_task"`
	
	StaffID		uint `json:"staff_id"`
	Staff		*Staff `gorm:"foreignKey:StaffID"`

	BuildingID	uint `json:"building_id"`
	Building	*Building `gorm:"foreignKey:BuildingID"`

}