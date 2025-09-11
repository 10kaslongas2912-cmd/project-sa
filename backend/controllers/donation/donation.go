// In file: controllers/donation/donation.go

package donation

import (
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
)

// ----------- Payload -----------

type CombinedDonationPayload struct {
	DonorInfo            entity.Donor          `json:"donor_info"`
	DonationType         string                `json:"donation_type"` // "money" | "item"
	MoneyDonationDetails *entity.MoneyDonation `json:"money_donation_details,omitempty"`
	ItemDonationDetails  []entity.ItemDonation `json:"item_donation_details,omitempty"`
}

// ----------- Handlers -----------

// CreateDonation
// - ถ้ามี token → ใช้ user_id จาก context เสมอ (ignore user_id ที่ client ส่งมา)
// - ถ้าไม่มี token → ถือเป็น guest; match ด้วย first_name + last_name + user_id IS NULL
func tryUserIDFromContext(c *gin.Context) *uint {
	if v, ok := c.Get("user_id"); ok {
		if id, ok2 := v.(uint); ok2 && id > 0 {
			return &id
		}
	}
	return nil
}

// ===== Handlers =====
func CreateDonation(c *gin.Context) {
	var payload CombinedDonationPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// validate donation_type ให้เหลือเฉพาะ money|item
	switch strings.ToLower(payload.DonationType) {
	case "money", "item":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported donation_type"})
		return
	}

	db := configs.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "panic: rolled back"})
		}
	}()

	// --- user vs guest: อาศัย context ที่ตั้งโดย OptionalAuthorize ---
	authedUserID := tryUserIDFromContext(c)

	incoming := payload.DonorInfo
	var donorToUse entity.Donor

	if authedUserID != nil {
		// ✅ ผู้ใช้ล็อกอิน → ยึด user_id จาก token เสมอ (ignore user_id ใน payload)
		if err := tx.Where("user_id = ?", *authedUserID).First(&donorToUse).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// ยังไม่มี donor สำหรับ user นี้ → สร้างใหม่
				donorToUse = entity.Donor{
					UserID:    authedUserID,
					FirstName: incoming.FirstName,
					LastName:  incoming.LastName,
					Email:     incoming.Email,
					Phone:     incoming.Phone,
					DonorType: pointer.P("user"),
				}
				if err := tx.Create(&donorToUse).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create donor for user: " + err.Error()})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to find donor by user_id: " + err.Error()})
				return
			}
		}
	} else {
		// 🟨 guest → match โดยชื่อ-สกุล(+อีเมล) และ user_id IS NULL
		q := tx.Where("first_name = ? AND last_name = ? AND user_id IS NULL", incoming.FirstName, incoming.LastName)
		if strings.TrimSpace(*incoming.Email) != "" {
			q = q.Where("email = ?", incoming.Email)
		}
		if err := q.First(&donorToUse).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				donorToUse = incoming
				donorToUse.ID = 0
				donorToUse.UserID = nil
				donorToUse.DonorType = pointer.P("guest")
				if err := tx.Create(&donorToUse).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create guest donor: " + err.Error()})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to find guest donor: " + err.Error()})
				return
			}
		}
	}

	// --- สร้าง Donation หลัก ---
	donation := entity.Donation{
		DonorID:      donorToUse.ID,
		DonationType: strings.ToLower(payload.DonationType), // "money" | "item"
		DonationDate: time.Now(),
		Status:       "success", // default
	}

	// ตั้งสถานะตามประเภท
	if donation.DonationType == "money" && payload.MoneyDonationDetails != nil {
		if payload.MoneyDonationDetails.PaymentType == "monthly" {
			donation.Status = "active"
			payload.MoneyDonationDetails.Status = "success"
		} else { // one-time
			donation.Status = "complete"
			payload.MoneyDonationDetails.Status = "success"
		}
	} else if donation.DonationType == "item" {
		donation.Status = "complete"
	}

	if err := tx.Create(&donation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create donation record: " + err.Error()})
		return
	}

	// --- แนบรายละเอียดตามประเภท ---
	switch donation.DonationType {
	case "money":
		if payload.MoneyDonationDetails != nil {
			md := payload.MoneyDonationDetails
			md.DonationID = donation.ID
			if err := tx.Create(md).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create money donation: " + err.Error()})
				return
			}
		}
	case "item":
		for i := range payload.ItemDonationDetails {
			payload.ItemDonationDetails[i].DonationID = donation.ID
			if err := tx.Create(&payload.ItemDonationDetails[i]).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create item donation: " + err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction commit failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Donation created successfully", "donation_id": donation.ID})
}

// GetMyDonations
// - ต้องมี token (อยู่หลัง Authorizes())
// - ถ้าไม่พบ donor → คืน [] (200)
// - คืนรายการพร้อม preload relations ให้ FE ใช้ได้ทันที
func GetMyDonations(c *gin.Context) {
	log.Println("--- GetMyDonations function called ---")
	uidAny, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user id in context"})
		return
	}
	userID, _ := uidAny.(uint)

	// หา donor ของ user นี้
	var donor entity.Donor
	if err := configs.DB().Where("user_id = ?", userID).First(&donor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, []entity.Donation{})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "find donor failed: " + err.Error()})
		return
	}

	// preload ความสัมพันธ์ที่ FE ใช้
	var donations []entity.Donation
	if err := configs.DB().
		Preload("MoneyDonations").
		Preload("MoneyDonations.PaymentMethod").
		Preload("ItemDonations").
		Preload("ItemDonations.Item").
		Preload("ItemDonations.Unit").
		Where("donor_id = ?", donor.ID).
		Order("donation_date desc").
		Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch donations: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, donations)
}

// GET /items
func GetAllItems(c *gin.Context) {
	var items []entity.Item
	if err := configs.DB().Find(&items).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GET /units
func GetAllUnits(c *gin.Context) {
	var units []entity.Unit
	if err := configs.DB().Find(&units).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, units)
}

// GetAllDonations retrieves all donation records
func GetAllDonations(c *gin.Context) {
	var donations []entity.Donation
	if err := configs.DB().
		Preload("Donor").
		Preload("MoneyDonations").
		Preload("ItemDonations").
		Preload("ItemDonations.Item").
		Preload("ItemDonations.Unit").
		Order("donation_date desc").
		Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch donations: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, donations)
}

func UpdateDonationStatus(c *gin.Context) {
	id := c.Param("id")
	var payload struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	validStatuses := map[string]bool{
		"active": true, "cancel": true, "success": true,
		"complete": true, "pending": true, "failed": true,
	}
	if !validStatuses[payload.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	var donation entity.Donation
	if err := configs.DB().First(&donation, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Donation not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if err := configs.DB().Model(&donation).Update("status", payload.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update donation status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Status updated successfully",
		"donation_id": id,
		"new_status":  payload.Status,
	})
}
