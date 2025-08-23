package entity

import "time"

type Volunteers struct {
	VolunteerID    uint      `gorm:"primarykey;autoIncrement" json:"volunteer_id"`
	Address        string    `json:"address"`
	PhoneNumber    string    `json:"phone_number"`
	AnotherContact string    `json:"another_contact"`
	HealthDetail   string    `json:"health_detail"`
	WorkingDate    time.Time `json:"working_date"`
	WorkingTime    string    `json:"working_time"`
	Skill          string    `json:"skill"`
	Note           string    `json:"note"`
	PhotoAdr       string    `json:"photo_adr"`

	UserID uint
	Users  *Users `gorm:"references:UserID"` // Association to Users

	SkillID uint
	Skills  *Skills `gorm:"foreignKey:SkillID"` // Association to Skills
}
