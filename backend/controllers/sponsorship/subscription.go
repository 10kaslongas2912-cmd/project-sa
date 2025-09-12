package sponsorship

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type cancelReq struct {
	CancelAtPeriodEnd *bool   `json:"cancel_at_period_end"`
	Status            *string `json:"status"` // optional
}
type reactivateReq struct {
	Status            *string `json:"status"`               // ควรเป็น "active"
	CancelAtPeriodEnd *bool   `json:"cancel_at_period_end"` // ควรเป็น false
}

func CancelSubscription(c *gin.Context) {
	uid := getUserIDFromCtx(c)
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	subIDu, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || subIDu == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	subID := uint(subIDu)

	db := configs.DB()

	// โหลด sponsorship ที่สัมพันธ์กับ subscription + ตรวจสิทธิ์ user
	var sp entity.Sponsorship
	if err := db.
		Preload("Subscription").
		Preload("SponsorshipPayments", func(tx *gorm.DB) *gorm.DB { return tx.Order("id DESC") }).
		Joins("JOIN subscriptions sub ON sub.sponsorship_id = sponsorships.id").
		Joins("JOIN sponsors s ON s.id = sponsorships.sponsor_id").
		Where("sub.id = ? AND s.kind = ? AND s.user_id = ?", subID, entity.SponsorKindUser, *uid).
		First(&sp).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	sub := sp.Subscription
	if sub == nil || sub.ID != subID {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	// ------- แกะ body -------
	var req cancelReq
	if err := c.ShouldBindJSON(&req); err != nil && !strings.Contains(err.Error(), "EOF") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	cancelAtPeriodEnd := true
	if req.CancelAtPeriodEnd != nil {
		cancelAtPeriodEnd = *req.CancelAtPeriodEnd
	}
	// สะกดสถานะให้คงที่
	newStatus := "cancelled"
	if req.Status != nil && *req.Status != "" {
		s := strings.ToLower(*req.Status)
		if s == "canceled" || s == "cancelled" {
			newStatus = "cancelled"
		}
	}

	// คำนวณ period end เพื่อตอบกลับ
	anchor := lastSucceededPaymentTime(sp, sub.ID)
	cpe := addInterval(anchor, sub.Interval)

	tx := db.Begin()

	cols := map[string]any{
		"status": newStatus,
	}
	if db.Migrator().HasColumn(&entity.Subscription{}, "cancel_at_period_end") {
		cols["cancel_at_period_end"] = cancelAtPeriodEnd
	}
	if !cancelAtPeriodEnd && db.Migrator().HasColumn(&entity.Subscription{}, "ended_at") {
		now := time.Now()
		cols["ended_at"] = &now
	}

	if err := tx.Model(&entity.Subscription{}).
		Where("id = ?", sub.ID).
		Updates(cols).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Model(&entity.Sponsorship{}).
		Where("id = ?", sub.SponsorshipID).
		Updates(map[string]any{"status": newStatus}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"subscription": gin.H{
			"id":                   sub.ID,
			"status":               newStatus,
			"current_period_end":   cpe,
			"cancel_at_period_end": cancelAtPeriodEnd, // จะหายไปเองถ้า FE ไม่ใช้
		},
	})
}


func ReactivateSubscription(c *gin.Context) {
	uid := getUserIDFromCtx(c)
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	subIDu, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || subIDu == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	subID := uint(subIDu)

	db := configs.DB()
	var sp entity.Sponsorship
	if err := db.
		Preload("Subscription").
		Preload("SponsorshipPayments", func(tx *gorm.DB) *gorm.DB { return tx.Order("id DESC") }).
		Joins("JOIN subscriptions sub ON sub.sponsorship_id = sponsorships.id").
		Joins("JOIN sponsors s ON s.id = sponsorships.sponsor_id").
		Where("sub.id = ? AND s.kind = ? AND s.user_id = ?", subID, entity.SponsorKindUser, *uid).
		First(&sp).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	sub := sp.Subscription
	if sub == nil || sub.ID != subID {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	// ------- แกะ body -------
	var req reactivateReq
	if err := c.ShouldBindJSON(&req); err != nil && !strings.Contains(err.Error(), "EOF") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	// ค่า default/normalize
	newStatus := "active"
	if req.Status != nil && strings.ToLower(*req.Status) == "active" {
		newStatus = "active"
	}
	setCancelAtPeriodEnd := false
	if req.CancelAtPeriodEnd != nil {
		setCancelAtPeriodEnd = *req.CancelAtPeriodEnd
	}

	// ตรวจสิทธิ์ reactivate: ต้องยังไม่เกิน period end ของรอบเดิม
	anchor := lastSucceededPaymentTime(sp, sub.ID)
	cpe := addInterval(anchor, sub.Interval)
	if time.Now().After(cpe) {
		c.JSON(http.StatusConflict, gin.H{"error": "period ended, cannot reactivate"})
		return
	}

	tx := db.Begin()

	cols := map[string]any{
		"status": newStatus,
	}
	if db.Migrator().HasColumn(&entity.Subscription{}, "cancel_at_period_end") {
		cols["cancel_at_period_end"] = setCancelAtPeriodEnd // ควรเป็น false
	}
	if db.Migrator().HasColumn(&entity.Subscription{}, "ended_at") {
		cols["ended_at"] = nil
	}

	if err := tx.Model(&entity.Subscription{}).
		Where("id = ?", sub.ID).
		Updates(cols).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Model(&entity.Sponsorship{}).
		Where("id = ?", sub.SponsorshipID).
		Updates(map[string]any{"status": newStatus}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"subscription": gin.H{
			"id":                   sub.ID,
			"status":               newStatus,
			"current_period_end":   cpe,
			"next_payment_at":      cpe, // รอบถัดไปเดิม
			"cancel_at_period_end": setCancelAtPeriodEnd,
		},
	})
}
