package entity
import (
	"gorm.io/gorm"
)
type Staff struct {
	gorm.Model
	UserID uint `json:"user_id"`
	User  Users `gorm:"foreignKey:UserID"`	
	Role  string `json:"role"` // admin, staff, vet, caretaker

	Kennel []Kennel `gorm:"foreignKey:StaffID"`
	Event []Event `gorm:"foreignKey:StaffID"`
	MedicalRecords []MedicalRecord `gorm:"foreignKey:StaffID"`
}