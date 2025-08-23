package entity
import (
	"gorm.io/gorm"
	"time"
)

type Adoption struct {
	gorm.Model
	AdoptionDate *time.Time `json:"adoption_date"`
	Status	   *string    `json:"status"`
	Notes         *string    `json:"notes"`

	AdopterID uint `json:"adopter_id"`
	Adopter   Adopter `gorm:"foreignKey:AdopterID"`

	DogID uint `json:"dog_id"`
	Dog   Dog  `gorm:"foreignKey:DogID"`
}