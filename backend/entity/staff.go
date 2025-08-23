package entity

import "time"

type Staffs struct {
	StaffID     uint      `gorm:"primarykey;autoIncrement" json:"staff_id"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Phone       string    `json:"phone"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Age         int       `json:"age"`
	GenderID    *uint
	Genders     Genders `gorm:"foreignKey:GenderID"`
	RoleID      *uint   `json:"role_id"`
	Role        Roles   `gorm:"foreignKey:RoleID"`
}
