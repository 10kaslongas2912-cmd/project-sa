package entity


type Kennel struct {
	KennelID uint `gorm:"primarykey;autoIncrement" json:"kennel_id"`
	Location string `json:"location"`
	Capacity uint `json:"capacity"`
	Color    string `json:"color"`
	Notes    string `json:"notes"`

	Dogs []Dog `gorm:"foreignKey:KennelID"`
	Staffs []Staff `gorm:"foreignKey:KennelID"`
	
}
