package entity
import (
	"gorm.io/gorm"
	// "time"
)

type Attendee struct {
	gorm.Model
	EventID uint      `json:"event_id"`
	Event   *Event     `gorm:"foreignKey:EventID" json:"event"`
	FirstName    string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Email   *string   `json:"email"`
	Phone   *string   `json:"phone"`
	// RegisteredAt *time.Time `gorm:"not null;default:current_timestamp" json:"registered_at"`
	// CheckedInAt  *time.Time `json:"checked_in_at"`
	Note        *string    `gorm:"type:text" json:"note"`
}