package entity

import "gorm.io/gorm"

type Gender struct {
   gorm.Model
   Gender string `json:"gender"`
}