package entity

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	gorm.Model
	Name        string     `gorm:"size:100;not null" json:"name"` 
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	StartAt     time.Time  `gorm:"not null" json:"start_at"`
	EndAt       time.Time  `gorm:"not null" json:"end_at"`
	Location    *string    `gorm:"size:255" json:"location,omitempty"`
	Organizer   *string    `gorm:"size:100" json:"organizer,omitempty"`
	ContactInfo *string    `gorm:"size:100" json:"contact_info,omitempty"`
	Capacity    *int       `gorm:"" json:"capacity,omitempty"`

	StaffID uint  `json:"staff_id"` // Foreign key for Staff
	Staff   *Staff `gorm:"foreignKey:StaffID"` // Association to Staff
	
	Attendees   []Attendee `gorm:"foreignKey:EventID" json:"attendees,omitempty"`
}