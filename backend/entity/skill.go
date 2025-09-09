package entity

import "gorm.io/gorm"

type Skill struct {
	gorm.Model
	Description string `json:"description" gorm:"uniqueIndex"`
}
