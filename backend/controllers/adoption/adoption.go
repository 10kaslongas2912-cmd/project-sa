package adopter

import (
	"errors"
	"net/http"
	"strconv"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DTO สำหรับรับข้อมูลจาก Frontend เพื่อสร้างคำขอ
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
	DogID       *uint   `json:"dog_id" binding:"required,gt=0"`
	UserID      *uint   `json:"user_id"`
}

// DTO สำหรับอัปเดตสถานะ
type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=approved rejected"`
}

// CreateAdoption จัดการการสร้างหรืออัปเดตคำขอรับเลี้ยงใหม่
func CreateAdoption(c *gin.Context) {
	var req CreateAdoptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้างตัวแปรสำหรับข้อความตอบกลับ
	message := "Adoption request created successfully"

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. ตรวจสอบสุนัข
		var dog entity.Dog
		if err := tx.First(&dog, req.DogID).Error; err != nil {
			return errors.New("dog not found")
		}

		// --- ส่วนที่แก้ไข: เปลี่ยนการ trả về error เพื่อให้จัดการได้ง่ายขึ้น ---
		if dog.IsAdopted {
			// คืนค่า error แบบมาตรฐาน
			return errors.New("dog has already been adopted")
		}
		// --- จบส่วนที่แก้ไข ---

		// --- ส่วนที่แก้ไข: ตรวจสอบและอัปเดต/สร้างคำขอ ---
		var existingRequest entity.Adopter
		err := tx.Where("user_id = ? AND dog_id = ?", req.UserID, req.DogID).First(&existingRequest).Error

		// ตรวจสอบ error ที่ไม่ใช่ "ไม่พบข้อมูล"
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("database error while checking for existing request")
		}

		// ถ้า err เป็น nil หมายความว่าเจอคำขอเดิมอยู่แล้ว
		if err == nil {
			// --- กรณีเจอคำขอเดิม: ให้อัปเดตข้อมูลด้วยข้อมูลล่าสุด ---
			existingRequest.FirstName = req.FirstName
			existingRequest.LastName = req.LastName
			existingRequest.PhoneNumber = req.PhoneNumber
			existingRequest.Address = req.Address
			existingRequest.District = req.District
			existingRequest.City = req.City
			existingRequest.Province = req.Province
			existingRequest.ZipCode = req.ZipCode
			existingRequest.Job = req.Job
			existingRequest.Income = req.Income
			// หากมีการอัปเดต ควรตั้งสถานะกลับเป็น pending เสมอ
			existingRequest.Status = "pending"

			if err := tx.Save(&existingRequest).Error; err != nil {
				return err // คืนค่า error ถ้าบันทึกไม่สำเร็จ
			}
			// เปลี่ยนข้อความตอบกลับเป็นการอัปเดต
			message = "Adoption request updated successfully"

		} else { // กรณีไม่เจอคำขอเดิม (gorm.ErrRecordNotFound)
			// --- กรณีไม่เจอคำขอเดิม: ให้สร้างใหม่ตามปกติ ---
			adopter := entity.Adopter{
				FirstName:   req.FirstName,
				LastName:    req.LastName,
				PhoneNumber: req.PhoneNumber,
				Address:     req.Address,
				District:    req.District,
				City:        req.City,
				Province:    req.Province,
				ZipCode:     req.ZipCode,
				Job:         req.Job,
				Income:      req.Income,
				DogID:       req.DogID,
				UserID:      req.UserID,
				Status:      "pending",
			}
			if err := tx.Create(&adopter).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		if err.Error() == "dog not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		// --- ส่วนที่แก้ไข: เปลี่ยนข้อความแจ้งเตือน ---
		if err.Error() == "dog has already been adopted" {
			// เปลี่ยนเป็นข้อความตามรูปภาพที่ส่งมา
			errorMessage := "คุณยังไม่ได้เลือกคืน โปรดเลือกคืนเพื่อรับเลี้ยงสุนัข"
			c.JSON(http.StatusConflict, gin.H{"error": errorMessage})
			return
		}
		// --- จบส่วนที่แก้ไข ---

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process adoption request: " + err.Error()})
		return
	}

	// ส่งข้อความตอบกลับตามสถานการณ์ (สร้างใหม่ หรือ อัปเดต)
	c.JSON(http.StatusOK, gin.H{"message": message})
}

// GetAllAdoptions ดึงข้อมูลคำขอรับเลี้ยงทั้งหมด
func GetAllAdoptions(c *gin.Context) {
	var adoptions []entity.Adopter
	db := configs.DB()
	// Preload เพื่อดึงข้อมูล Dog และ User ที่เกี่ยวข้องมาด้วย
	if err := db.Preload("Dog").Preload("User").Find(&adoptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve adoptions: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": adoptions})
}

// UpdateAdoptionStatus อัปเดตสถานะของคำขอ (อนุมัติ/ปฏิเสธ)
func UpdateAdoptionStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var adopter entity.Adopter
	db := configs.DB()
	if err := db.First(&adopter, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Adoption record not found"})
		return
	}

	// --- ส่วนที่แก้ไข: เปลี่ยนข้อความแจ้งเตือน ---
	// ทำการตรวจสอบนี้ก่อนเริ่ม Transaction เพื่อป้องกันการทำงานที่ไม่จำเป็น
	if req.Status == "approved" {
		var dog entity.Dog
		if err := db.First(&dog, adopter.DogID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found for this request"})
			return
		}
		if dog.IsAdopted {
			// เปลี่ยนเป็นข้อความตามรูปภาพที่ส่งมา
			errorMessage := "คุณยังไม่ได้เลือกคืน โปรดเลือกคืนเพื่อรับเลี้ยงสุนัข"
			c.JSON(http.StatusConflict, gin.H{"error": errorMessage})
			return
		}
	}
	// --- จบส่วนที่แก้ไข ---

	// ใช้ Transaction เพื่อความปลอดภัย
	err = db.Transaction(func(tx *gorm.DB) error {
		// 1. อัปเดตสถานะของ Adopter
		if err := tx.Model(&adopter).Update("status", req.Status).Error; err != nil {
			return err
		}
		if req.Status == "approved" {
			// 2. ถ้าอนุมัติ, ต้องทำให้สุนัขเป็นสถานะรับเลี้ยงแล้ว
			if err := tx.Model(&entity.Dog{}).Where("id = ?", adopter.DogID).Update("is_adopted", true).Error; err != nil {
				return err
			}

			// --- ส่วนที่เพิ่มเข้ามา: ปฏิเสธคำขออื่นอัตโนมัติ ---
			// ค้นหาและปฏิเสธคำขออื่นๆ ทั้งหมดที่เกี่ยวกับสุนัขตัวเดียวกันและยังรอพิจารณาอยู่
			// โดยจะอัปเดตทุกคำขอที่มี dog_id เดียวกัน, สถานะเป็น 'pending', และไม่ใช่ ID ของคำขอที่เพิ่งอนุมัติไป
			if err := tx.Model(&entity.Adopter{}).
				Where("dog_id = ? AND status = ? AND id != ?", adopter.DogID, "pending", adopter.ID).
				Update("status", "rejected").Error; err != nil {
				return err // หากเกิดข้อผิดพลาด ให้ยกเลิก Transaction
			}
			// --- จบส่วนที่เพิ่มเข้ามา ---
		}
		// 2. ถ้าปฏิเสธ, ต้องทำให้สุนัขกลับมาว่าง
		if req.Status == "rejected" {
			if err := tx.Model(&entity.Dog{}).Where("id = ?", adopter.DogID).Update("is_adopted", false).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

// DeleteAdoption ลบข้อมูลคำขอรับเลี้ยง
func DeleteAdoption(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var adopter entity.Adopter
	db := configs.DB()
	// ค้นหา record ที่ต้องการลบก่อน
	if err := db.First(&adopter,id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Adoption record not found"})
		return
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		// ถ้าคำขอเคยถูกอนุมัติไปแล้ว, ต้องทำให้สุนัขกลับมาว่างก่อนลบ
		if adopter.Status == "approved" {
			if err := tx.Model(&entity.Dog{}).Where("id = ?", adopter.DogID).Update("is_adopted", false).Error; err != nil {
				return err
			}
		}

		// ทำการลบข้อมูล Adopter
		// GORM จะใช้ Soft Delete โดยอัตโนมัติ (ตั้งค่า deleted_at)
		if err := tx.Delete(&adopter).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete adoption record: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Adoption record deleted successfully"})
}

func GetMyCurrentAdoptions(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format in token"})
		return
	}

	var currentAdoptions []entity.Adopter
	db := configs.DB()

	err := db.Preload("Dog").
		Where("user_id = ? AND status = ?", userID, "approved").
		Find(&currentAdoptions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch user's current adoptions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": currentAdoptions})
}