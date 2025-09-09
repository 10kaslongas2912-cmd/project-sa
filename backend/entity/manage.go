package entity

import (
	"time"

	"gorm.io/gorm"
)

type Manage struct {
	gorm.Model
	DateWork	time.Time
	
	TyeTask	string	`json:"type_task" gorm:"not null"`
	DetailTask	string	`json:"detail_task"`
	Username string `json:"username"`
	
	StaffID		uint
	Staff		*Staff `gorm:"foreignKey:StaffID"`

	BuildingID	uint
	Building	*Building `gorm:"foreignKey:BuildingID"`

}