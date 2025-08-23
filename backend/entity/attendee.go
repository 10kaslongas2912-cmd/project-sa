package entity
import (
	"gorm.io/gorm"
	"time"
)

type Attendee struct {
	gorm.Model
	EventID uint      `json:"event_id"`
	Event   Event     `gorm:"foreignKey:EventID"`
	Name    string    `gorm:"size:100;not null" json:"name"`
	Email   *string   `gorm:"size:100" json:"email,omitempty"`
	Phone   *string   `gorm:"size:20" json:"phone,omitempty"`
	RegisteredAt time.Time `gorm:"not null;default:current_timestamp" json:"registered_at"`
	CheckedInAt  *time.Time `json:"checked_in_at,omitempty"`
	Notes        *string    `gorm:"type:text" json:"notes,omitempty"`
}