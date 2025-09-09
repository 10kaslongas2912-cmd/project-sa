package entity

import (
	"gorm.io/gorm"
)

type Zone struct {
	gorm.Model
	Name string `json:"name"`
}
