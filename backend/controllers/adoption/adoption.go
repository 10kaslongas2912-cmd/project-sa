package adopter

import (
	"errors"
	"net/http"

	"example.com/project-sa/configs" // <-- ตรวจสอบ path
	"example.com/project-sa/entity"  // <-- ตรวจสอบ path
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// --- DTOs (Data Transfer Objects) ---

// CreateAdoptionRequest DTO สำหรับรับข้อมูลจาก Frontend ตอนสร้างคำขอ
type CreateAdoptionRequest struct {
	FirstName   string  `json:"first_name" binding:"required"`
	LastName    string  `json:"last_name" binding:"required"`
	PhoneNumber string  `json:"phone_number" binding:"required"`
	Address     string  `json:"address" binding:"required"`
	District    string  `json:"district" binding:"required"`
	City        string  `json:"city" binding:"required"`
	Province    string  `json:"province" binding:"required"`
	ZipCode     string  `json:"zip_code" binding:"required"`
	Job         string  `json:"job" binding:"required"`
	Income      float64 `json:"income"`
	DogID       uint    `json:"dog_id" binding:"required,gt=0"`
	UserID      *uint   `json:"user_id"`
}

// UpdateAdoptionStatusRequest DTO สำหรับรับข้อมูลตอนอัปเดตสถานะ
type UpdateAdoptionStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=approved rejected"`
}

// --- Handlers ---

// CreateAdoption :: POST /adoptions
func CreateAdoption(c *gin.Context) {
	var req CreateAdoptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := configs.DB()
	// ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. ตรวจสอบสุนัข
		var dog entity.Dog
		if err := tx.First(&dog, req.DogID).Error; err != nil {
			return errors.New("dog not found")
		}
		if dog.IsAdopted {
			return errors.New("dog has already been adopted")
		}

		// 2. สร้าง Adopter
		adopter := entity.Adopter{
			FirstName: req.FirstName, LastName: req.LastName, PhoneNumber: req.PhoneNumber,
			Address: req.Address, District: req.District, City: req.City, Province: req.Province,
			ZipCode: req.ZipCode, Job: req.Job, Income: req.Income,
			DogID: req.DogID, UserID: req.UserID, Status: "pending",
		}
		if err := tx.Create(&adopter).Error; err != nil {
			return err
		}

		// 3. อัปเดตสถานะสุนัข
		if err := tx.Model(&dog).Update("is_adopted", true).Error; err != nil {
			return err
		}

		return nil // Commit transaction
	})

	if err != nil {
		if err.Error() == "dog not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "dog has already been adopted" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create adoption request: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Adoption request created successfully"})
}

// GetAllAdoptions :: GET /adoptions
func GetAllAdoptions(c *gin.Context) {
	var adoptions []entity.Adopter
	db := configs.DB()

	// Preload คือการดึงข้อมูลที่เกี่ยวข้อง (Dog, User) มาพร้อมกันในครั้งเดียว
	if err := db.Preload("Dog").Preload("User").Order("created_at DESC").Find(&adoptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve adoption requests: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": adoptions})
}

// UpdateAdoptionStatus :: PATCH /adoptions/:id/status
func UpdateAdoptionStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateAdoptionStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. ค้นหาคำขอ
		var adopter entity.Adopter
		if err := tx.First(&adopter, id).Error; err != nil {
			return errors.New("adoption request not found")
		}

		// 2. ตรวจสอบเงื่อนไข (อัปเดตได้เฉพาะสถานะ pending)
		if adopter.Status != "pending" {
			return errors.New("only pending requests can be updated")
		}

		// 3. อัปเดตสถานะ
		adopter.Status = req.Status
		if err := tx.Save(&adopter).Error; err != nil {
			return err
		}

		// 4. ถ้าปฏิเสธ ให้เปลี่ยนสถานะสุนัขกลับเป็น "ว่าง"
		if req.Status == "rejected" {
			if err := tx.Model(&entity.Dog{}).Where("id = ?", adopter.DogID).Update("is_adopted", false).Error; err != nil {
				return err
			}
		}

		return nil // Commit transaction
	})

	if err != nil {
		if err.Error() == "adoption request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "only pending requests can be updated" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}