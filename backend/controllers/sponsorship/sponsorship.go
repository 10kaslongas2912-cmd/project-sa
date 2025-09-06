// controllers/sponsorship/sponsorship.go
package sponsorship

import (
	"errors"
	"net/http"
	"strings"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ===== Requests/Responses ===== */

type UpdatesPref struct {
	Enabled   bool    `json:"enabled"`
	Channel   *string `json:"channel"`   // "email" | "sms" | "line" | null
	Frequency *string `json:"frequency"` // null ได้
}

// FE:
// sponsor_data: user/guest (+ update?)
// updates: ตั้งค่าระดับ "sponsorship" (ออปชัน) — ถ้าไม่ส่งจะไม่ตั้งค่าใน sp.*
type SponsorData struct {
	Kind      string  `json:"kind" binding:"required"` // "user" | "guest"
	UserID    *uint   `json:"user_id,omitempty"`
	Title     *string `json:"title,omitempty"`
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Email     *string `json:"email,omitempty"`
	Phone     *string `json:"phone,omitempty"`
	// Update    *UpdatesPref `json:"update,omitempty"` // ระดับ Sponsor
}

type SponsorshipRequest struct {
	SponsorData     SponsorData  `json:"sponsor_data" binding:"required"`
	PlanType        string       `json:"plan_type" binding:"required"` // "one-time" | "subscription"
	DogID           uint         `json:"dog_id" binding:"required"`
	Amount          int64        `json:"amount" binding:"required,min=1"`
	Status          string       `json:"status"` // FE: "Active" | "Paided" → map ภายใน
	PaymentMethodID uint         `json:"payment_method_id" binding:"required"`
	Frequency       *string      `json:"frequency"` // sub เท่านั้น
	Update         *UpdatesPref `json:"update,omitempty"` // 🆕 ระดับ Sponsorship (override รายตัว)
}

type OneTimeResponse struct {
	SponsorshipID uint `json:"sponsorship_id"`
	PaymentID     uint `json:"payment_id"`
}

type SubscriptionResponse struct {
	SponsorshipID  uint `json:"sponsorship_id"`
	SubscriptionID uint `json:"subscription_id"`
	PaymentID      uint `json:"payment_id"`
}

/* ===== Helpers ===== */

func getUserIDFromCtx(c *gin.Context) *uint {
	if v, ok := c.Get("user_id"); ok {
		if uid, ok2 := v.(uint); ok2 && uid > 0 {
			return &uid
		}
	}
	return nil
}

func norm(s string) string { return strings.TrimSpace(strings.ToLower(s)) }

func mapPlanType(fe string) string {
	switch norm(fe) {
	case "one-time", "one_time", "one time":
		return "one-time"
	case "subscription":
		return "subscription"
	default:
		return ""
	}
}

// FE "Active" | "Paided" | "Paid"
func mapStatus(fe string, fallback string) string {
	switch strings.ToLower(strings.TrimSpace(fe)) {
	case "active":
		return "active"
	case "paided", "paid":
		return "paid"
	case "":
		return strings.ToLower(fallback)
	default:
		return strings.ToLower(fe)
	}
}

// --- updates normalization ---

func normChannel(p *string) *string {
	if p == nil {
		return nil
	}
	c := norm(*p)
	switch c {
	case "email", "sms", "line":
		return &c
	}
	return nil
}

func normFrequency(p *string) *string {
	if p == nil {
		return nil
	}
	f := norm(*p)
	switch f {
	case "weekly", "biweekly", "monthly", "quarterly":
		return &f
	}
	return nil
}

// func applySponsorUpdatesIfAny(tx *gorm.DB, s *entity.Sponsor, upd *UpdatesPref) error {
// 	if upd == nil {
// 		return nil
// 	}
// 	s.Enabled = upd.Enabled
// 	s.Channel = normChannel(upd.Channel)
// 	s.Frequency = normFrequency(upd.Frequency)
// 	return tx.Save(s).Error
// }

func applySponsorshipUpdatesIfAny(sp *entity.Sponsorship, upd *UpdatesPref) {
	if upd == nil {
		return
	}
	sp.Enabled = upd.Enabled
	sp.Channel = normChannel(upd.Channel)
	sp.Frequency = normFrequency(upd.Frequency)
}

// --- validate sponsor_data ---

func validateSponsorData(sd SponsorData, userIDFromCtx *uint) error {
	k := norm(sd.Kind)
	if k == "user" {
		if userIDFromCtx == nil && (sd.UserID == nil || *sd.UserID == 0) {
			return errors.New("user_id required for kind=user")
		}
		return nil
	}
	if k == "guest" {
		if sd.FirstName == nil || strings.TrimSpace(*sd.FirstName) == "" {
			return errors.New("first_name required for kind=guest")
		}
		if sd.LastName == nil || strings.TrimSpace(*sd.LastName) == "" {
			return errors.New("last_name required for kind=guest")
		}
		if sd.Email == nil || strings.TrimSpace(*sd.Email) == "" {
			return errors.New("email required for kind=guest")
		}
		if sd.Phone == nil || strings.TrimSpace(*sd.Phone) == "" {
			return errors.New("phone required for kind=guest")
		}
		return nil
	}
	return errors.New("invalid sponsor_data.kind")
}

// --- Sponsor finder/creator ---

func findOrCreateSponsor(tx *gorm.DB, sd SponsorData, userIDFromCtx *uint) (*entity.Sponsor, error) {
	k := norm(sd.Kind)

	// user
	if k == "user" {
		var uid uint
		if userIDFromCtx != nil && *userIDFromCtx > 0 {
			uid = *userIDFromCtx
		} else if sd.UserID != nil && *sd.UserID > 0 {
			uid = *sd.UserID
		} else {
			return nil, errors.New("user_id not found for kind=user")
		}

		var s entity.Sponsor
		err := tx.Where("user_id = ?", uid).First(&s).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				s.Kind = entity.SponsorKindUser
				s.UserID = &uid
				if err := tx.Create(&s).Error; err != nil {
					return nil, err
				}
				return &s, nil
			}
			return nil, err
		}
		return &s, nil
	}

	// guest
	first := strings.TrimSpace(deref(sd.FirstName))
	last := strings.TrimSpace(deref(sd.LastName))
	email := strings.ToLower(strings.TrimSpace(deref(sd.Email)))
	phone := strings.TrimSpace(deref(sd.Phone))

	var s entity.Sponsor
	err := tx.
		Where("kind = ? AND email = ? AND phone = ? AND first_name = ? AND last_name = ?",
			entity.SponsorKindGuest, email, phone, first, last).
		First(&s).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.Kind = entity.SponsorKindGuest
			if sd.Title != nil {
				s.Title = sd.Title
			}
			s.Email = &email
			s.Phone = &phone
			s.FirstName = &first
			s.LastName = &last
			if err := tx.Create(&s).Error; err != nil {
				return nil, err
			}
			return &s, nil
		}
		return nil, err
	}
	return &s, nil
}

func deref(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func ensurePaymentMethod(tx *gorm.DB, id uint) error {
	var pm entity.PaymentMethod
	return tx.First(&pm, id).Error
}

func ensureDog(tx *gorm.DB, id uint) error {
	var dog entity.Dog
	return tx.First(&dog, id).Error
}

/* ===== Handlers ===== */

// POST /sponsorships/one-time
func CreateOneTimeSponsorship(c *gin.Context) {
	var req SponsorshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
	c.JSON(http.StatusBadRequest, gin.H{
		"error":   "invalid request",
		"details": err.Error(), // ⬅️ บอกเลยว่า field ไหนผิดชนิด/ขาด
	})
	return
	}
	if mapPlanType(req.PlanType) != "one-time" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan_type must be one-time for this endpoint"})
		return
	}

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := ensureDog(tx, req.DogID); err != nil { return err }
		if err := ensurePaymentMethod(tx, req.PaymentMethodID); err != nil { return err }

		uid := getUserIDFromCtx(c)
		if err := validateSponsorData(req.SponsorData, uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid sponsor_data",
			"details": err.Error(), // "first_name required for kind=guest" ฯลฯ
		})
		return err
		}
		sponsor, err := findOrCreateSponsor(tx, req.SponsorData, uid)
		if err != nil { return err }

		// ✅ อัปเดตค่าข่าวสารระดับ Sponsor ถ้าส่งมา
		// if err := applySponsorUpdatesIfAny(tx, sponsor, req.SponsorData.Update); err != nil {
		// 	return err
		// }

		status := mapStatus(req.Status, "paid")
		sp := entity.Sponsorship{
			SponsorID: sponsor.ID,
			DogID:     req.DogID,
			PlanType:  "one-time",
			Amount:    req.Amount,
			Status:    &status,
		}

		// ✅ ตั้งค่าข่าวสารระดับ Sponsorship ถ้าส่งมา
		applySponsorshipUpdatesIfAny(&sp, req.Update)

		if err := tx.Create(&sp).Error; err != nil { return err }

		pmt := entity.SponsorshipPayment{
			SponsorshipID:   sp.ID,
			PaymentMethodID: req.PaymentMethodID,
			Amount:          sp.Amount,
			Status:          "SUCCEEDED",
		}
		if err := tx.Create(&pmt).Error; err != nil { return err }

		c.JSON(http.StatusCreated, OneTimeResponse{
			SponsorshipID: sp.ID,
			PaymentID:     pmt.ID,
		})
		return nil
	})

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

// POST /sponsorships/subscriptions
func CreateSubscriptionSponsorship(c *gin.Context) {
	var req SponsorshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}
	if mapPlanType(req.PlanType) != "subscription" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan_type must be subscription for this endpoint"})
		return
	}
	uid := getUserIDFromCtx(c)
	if uid == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "login required for subscription"})
		return
	}
	switch norm(deref(req.Frequency)) { // validate frequency
	case "monthly", "quarterly", "yearly":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid frequency"})
		return
	}

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := ensureDog(tx, req.DogID); err != nil { return err }
		if err := ensurePaymentMethod(tx, req.PaymentMethodID); err != nil { return err }

		if err := validateSponsorData(req.SponsorData, uid); err != nil { return err }
		sponsor, err := findOrCreateSponsor(tx, req.SponsorData, uid)
		if err != nil { return err }

		// ✅ อัปเดตค่าข่าวสารระดับ Sponsor ถ้าส่งมา
		// if err := applySponsorUpdatesIfAny(tx, sponsor, req.SponsorData.Update); err != nil {
		// 	return err
		// }

		status := mapStatus(req.Status, "active")
		sp := entity.Sponsorship{
			SponsorID: sponsor.ID,
			DogID:     req.DogID,
			PlanType:  "subscription",
			Amount:    req.Amount,
			Status:    &status,
		}

		// ✅ ตั้งค่าข่าวสารระดับ Sponsorship ถ้าส่งมา
		applySponsorshipUpdatesIfAny(&sp, req.Update)

		if err := tx.Create(&sp).Error; err != nil { return err }

		sub := entity.Subscription{
			SponsorshipID: sp.ID,
			Interval:      strings.ToLower(deref(req.Frequency)),
		}
		if err := tx.Create(&sub).Error; err != nil { return err }

		pmt := entity.SponsorshipPayment{
			SponsorshipID:   sp.ID,
			SubscriptionID:  &sub.ID,
			PaymentMethodID: req.PaymentMethodID,
			Amount:          sp.Amount,
			Status:          "AUTHORIZED",
		}
		if err := tx.Create(&pmt).Error; err != nil { return err }

		c.JSON(http.StatusCreated, SubscriptionResponse{
			SponsorshipID:  sp.ID,
			SubscriptionID: sub.ID,
			PaymentID:      pmt.ID,
		})
		return nil
	})

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}
