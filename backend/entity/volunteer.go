package entity

import (
	"time"

	"gorm.io/gorm"
)

type Volunteer struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	User   User   `gorm:"foreignKey:UserID"`
	Role   string `json:"role"` // admin, staff, vet, caretaker

	Address        string    `json:"address"`         //not have in frontend
	AnotherContact string    `json:"another_contact"` //already have in frontend
	HealthDetail   string    `json:"health_detail"`   //not have in frontend
	WorkingDate    time.Time `json:"working_date"`    //already have in frontend
	WorkingTime    string    `json:"working_time"`    //already have in frontend
	Skill          *string   `json:"skill"`           //already have in frontend
	Note           string    `json:"note"`            //already have in frontend = แรงจูงใจ
	StatusFVID     uint      `json:"status_fv_id"`
	StatusFV       StatusFV  `json:"status_fv" gorm:"foreignKey:StatusFVID"`
}
