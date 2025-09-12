package entity

import "gorm.io/gorm"

type Dog struct {
	gorm.Model
	Name         string `json:"name"`
	DateOfBirth  string `json:"date_of_birth"` // "YYYY-MM-DD"
	SterilizedAt string `json:"sterilized_at"`
	PhotoURL     string `json:"photo_url"`
	ReadyToAdopt bool   `json:"ready_to_adopt"`
	IsAdopted    bool   `json:"is_adopted"`

	BreedID uint   `json:"breed_id"`
	Breed   *Breed `gorm:"foreignKey:BreedID" json:"breed"`

	KennelID *uint   `json:"kennel_id"`
	Kennel   *Kennel `gorm:"foreignKey:KennelID" json:"kennel"`

	AnimalSexID  uint        `json:"animal_sex_id"`
	AnimalSex    *AnimalSex  `gorm:"foreignKey:AnimalSexID" json:"animal_sex"`
	AnimalSizeID uint        `json:"animal_size_id"`
	AnimalSize   *AnimalSize `gorm:"foreignKey:AnimalSizeID" json:"animal_size"`

	// --- Audit (ผูกกับตาราง staffs) ---
	CreatedByID *uint  `gorm:"column:created_by_id" json:"created_by_id"`
	CreatedBy   *Staff `gorm:"foreignKey:CreatedByID;constraint:OnUpdate:RESTRICT,OnDelete:SET NULL;" json:"created_by"`

	UpdatedByID *uint  `gorm:"column:updated_by_id" json:"updated_by_id"`
	UpdatedBy   *Staff `gorm:"foreignKey:UpdatedByID;constraint:OnUpdate:RESTRICT,OnDelete:SET NULL;" json:"updated_by"`

	DeletedByID *uint  `gorm:"column:deleted_by_id" json:"deleted_by_id"`
	DeletedBy   *Staff `gorm:"foreignKey:DeletedByID ;constraint:OnUpdate:RESTRICT,OnDelete:SET NULL;" json:"deleted_by"`

	// Relations อื่น ๆ
	MedicalRecords   []MedicalRecord  `gorm:"foreignKey:DogID" json:"medical_records"`
	Adoptions        []Adoption       `gorm:"foreignKey:DogID" json:"adoptions"`
	Sponsorships     []Sponsorship    `gorm:"foreignKey:DogID" json:"sponsorships"`
	DogPersonalities []DogPersonality `gorm:"foreignKey:DogID" json:"dog_personalities"`
}
