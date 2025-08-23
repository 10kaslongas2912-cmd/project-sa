package entity

type Roles struct {
	RoleID uint   `gorm:"primarykey;autoIncrement" json:"role_id"`
	Name   string `json:"name"`
}
