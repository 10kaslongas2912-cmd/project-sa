package entity

import (
	"time"

	"gorm.io/gorm"
)

type Volunteer struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	User   User   `gorm:"foreignKey:UserID"`
	Skills string `json:"skills"`
	Role   string `json:"role"` // admin, staff, vet, caretaker

	Notes          string    `json:"notes"`
	VolunteerID    uint      `gorm:"primarykey;autoIncrement" json:"volunteer_id"`
	Address        string    `json:"address"`
	PhoneNumber    string    `json:"phone_number"`
	AnotherContact string    `json:"another_contact"`
	HealthDetail   string    `json:"health_detail"`
	WorkingDate    time.Time `json:"working_date"`
	WorkingTime    string    `json:"working_time"`
	Skill          string    `json:"skill"`
	Note           string    `json:"note"`
	PhotoAdr       string    `json:"photo_adr"`
}
