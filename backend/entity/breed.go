package entity


type Breed struct {
	BreedID     uint   `gorm:"primarykey;autoIncrement" json:"breed_id"`
	BreedName   string `json:"breed_name"`
	Description string `json:"description"`

	Dog []Dog `gorm:"foreignKey:BreedID"`
}
