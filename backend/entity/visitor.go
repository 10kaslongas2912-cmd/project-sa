package entity

import (
	"gorm.io/gorm"
)

type Visitor struct {
	gorm.Model
	
	VisitorFirstName string `json:"visitor_firstname"`
	VisitorLastName  string `json:"visitor_lastname"`
	VisitorPhone     string `json:"visitor_phone"`
	VisitorEmail     string `json:"visitor_email"`
	VisitorAge       uint   `json:"visitor_age"`
	VisitorGender    string `json:"visitot_gender"`

	UserID uint  `json:"user_id"` // Foreign key for User
	User   *User `gorm:"foreignKey:UserID" json:"user"` // Association to User


	VisitID uint  `json:"visit_id"` // Foreign key for Visit
	Visit   *Visit `gorm:"foreignKey:VisitID" json:"visit"` // Association to Visit
}