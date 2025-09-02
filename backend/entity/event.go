package entity

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	gorm.Model
	Name        string     `json:"name"` 
	Description *string    `json:"description"`
	StartAt     time.Time  `json:"start_at"`
	EndAt       time.Time  `json:"end_at"`
	Location    *string    `json:"location"`
	Organizer   *string    `json:"organizer"`
	ContactInfo *string    `json:"contact_info"`
	Capacity    *int       `json:"capacity,"`

	StaffID uint  `json:"staff_id"` // Foreign key for Staff
	Staff   *Staff `gorm:"foreignKey:StaffID" json:"staff"` // Association to Staff
	
	Attendees   []Attendee `gorm:"foreignKey:EventID" json:"attendees"`
}