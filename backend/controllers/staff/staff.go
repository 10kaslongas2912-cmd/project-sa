package staff

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"example.com/project-sa/entity"
	"example.com/project-sa/configs"
)

// ------------------ CREATE ------------------
type CreateStaffRequest struct {
	Username    string  `json:"username" binding:"required"`
	Password    string  `json:"password" binding:"required"`
	FirstName   string  `json:"first_name" binding:"required"`
	LastName    string  `json:"last_name" binding:"required"`
	Email       string  `json:"email"`
	Phone       string  `json:"phone"`
	DateOfBirth string  `json:"date_of_birth"`
	Note        *string `json:"note"`
	RoleID      uint    `json:"role_id" binding:"required,gt=0"`
	ZoneID      uint    `json:"zone_id" binding:"required,gt=0"`
	GenderID    uint    `json:"gender_id" binding:"required,gt=0"`
	Status      *string `json:"status"`
}

func CreateStaff(c *gin.Context) {
	var req CreateStaffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	staff := entity.Staff{
		Username:    req.Username,
		Password:    req.Password, // ✅ ปกติควร Hash password ก่อนเก็บ
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		Phone:       req.Phone,
		DateOfBirth: req.DateOfBirth,
		Note:        req.Note,
		RoleID:      req.RoleID,
		ZoneID:      req.ZoneID,
		GenderID:    req.GenderID,
		Status:      req.Status,
	}

	if err := configs.DB().Create(&staff).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create staff"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "staff created successfully", "data": staff})
}

// ------------------ READ (Get all) ------------------
func GetAllStaffs(c *gin.Context) {
	var staffs []entity.Staff
	if err := configs.DB().Preload("Role").Preload("Zone").Preload("Gender").Find(&staffs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch staffs"})
		return
	}
	c.JSON(http.StatusOK, staffs)
}

// ------------------ READ (Get by ID) ------------------
func GetStaffById(c *gin.Context) {
	id := c.Param("id")
	var staff entity.Staff
	if err := configs.DB().Preload("Role").Preload("Zone").Preload("Gender").First(&staff, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "staff not found"})
		return
	}
	c.JSON(http.StatusOK, staff)
}

// ------------------ UPDATE ------------------
func UpdateStaff(c *gin.Context) {
	id := c.Param("id")
	var staff entity.Staff
	if err := configs.DB().First(&staff, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "staff not found"})
		return
	}

	var req CreateStaffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	staff.Username = req.Username
	staff.FirstName = req.FirstName
	staff.LastName = req.LastName
	staff.Email = req.Email
	staff.Phone = req.Phone
	staff.DateOfBirth = req.DateOfBirth
	staff.Note = req.Note
	staff.RoleID = req.RoleID
	staff.ZoneID = req.ZoneID
	staff.GenderID = req.GenderID
	staff.Status = req.Status

	// ✅ update password เฉพาะถ้าส่งมาใหม่
	if req.Password != "" {
		staff.Password = req.Password // ควร hash ด้วย
	}

	if err := configs.DB().Save(&staff).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update staff"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "staff updated successfully", "data": staff})
}

// ------------------ DELETE ------------------
func DeleteStaff(c *gin.Context) {
	id := c.Param("id")
	if err := configs.DB().Delete(&entity.Staff{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete staff"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "staff deleted successfully"})
}
