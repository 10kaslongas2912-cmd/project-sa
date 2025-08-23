package entity

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	gorm.Model
	Name        string     `gorm:"size:100;not null"`
	Description *string    `gorm:"type:text"`
	StartAt     time.Time  `gorm:"not null"`
	EndAt       time.Time  `gorm:"not null"`
	Location    *string    `gorm:"size:255"`
	Organizer   *string    `gorm:"size:100"`
	ContactInfo *string    `gorm:"size:100"`
	Capacity    *int       `gorm:""`
	Attendees   []Attendee `gorm:"foreignKey:EventID"`
}