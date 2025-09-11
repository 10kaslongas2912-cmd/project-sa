package entity

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	gorm.Model
	Name        string     `json:"name" gorm:"not null"`
	Description *string    `json:"description"`
	StartAt     time.Time  `json:"start_at"`
	EndAt       time.Time  `json:"end_at"`
	Location    *string    `json:"location"`
	Organizer   *string    `json:"organizer"`
	ContactInfo *string    `json:"contact_info"`
	Capacity    *int       `json:"capacity"`
	ImageURL    *string    `json:"image_url"`
	
	// Optional: Foreign key for Visit (if this event is related to a specific visit)
	VisitID *uint  `json:"visit_id,omitempty"`
	Visit   *Visit `gorm:"foreignKey:VisitID" json:"visit,omitempty"`
	
	// Optional: Foreign key for MedicalRecord (if this event is related to a specific medical record)
	MedicalRecordID *uint          `json:"medical_record_id,omitempty"`
	MedicalRecord   *MedicalRecord `gorm:"foreignKey:MedicalRecordID" json:"medical_record,omitempty"`
}