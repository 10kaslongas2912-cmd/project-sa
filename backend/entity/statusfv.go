package entity

import "gorm.io/gorm"

type StatusFV struct {
	gorm.Model
	Status string `json:"status" gorm:"uniqueIndex"`
}
