package entity

import "gorm.io/gorm"

type Gender struct {
   gorm.Model
   Name string `json:"name"`

   Users []User `gorm:"foreignKey:GenderID" json:"users"`
   Sponsors []Sponsor `gorm:"foreignKey:GenderID" json:"sponsors"`   
   Staffs []Staff `gorm:"foreignKey:GenderID" json:"staffs"`
}