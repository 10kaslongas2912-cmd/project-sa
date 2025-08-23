package entity

type Skills struct {
	SkillID     uint   `gorm:"primarykey;autoIncrement" json:"skill_id"`
	Description string `json:"description"`
}
