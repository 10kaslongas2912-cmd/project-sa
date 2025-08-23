package entity

import "gorm.io/gorm"

type Genders struct {
   gorm.Model
   Gender string `json:"gender"`
   
   Sponsors []Sponsor `gorm:"foreignKey:GenderID"`
}