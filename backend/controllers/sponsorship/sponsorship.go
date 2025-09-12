// controllers/sponsorship/sponsorship.go
package sponsorship

import (
	"bytes"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ===== Requests/Responses ===== */

type UpdatesPref struct {
	Enabled   bool    `json:"enabled"`
	Channel   *string `json:"channel"`   // "email" | "sms" | "line" | null
	Frequency *string `json:"frequency"` // "weekly" | "biweekly" | "monthly" | "quarterly" | null
}

type SponsorData struct {
	Kind      string  `json:"kind" binding:"required"` // "user" | "guest"
	UserID    *uint   `json:"user_id,omitempty"`
	Title     *string `json:"title,omitempty"`
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Email     *string `json:"email,omitempty"`
	Phone     *string `json:"phone,omitempty"`
	GenderID  *uint   `json:"gender_id,omitempty"`
	// Update *UpdatesPref `json:"update,omitempty"` // ระดับ Sponsor (เปิดเมื่อพร้อม)
}

type SponsorshipRequest struct {
	SponsorData     SponsorData  `json:"sponsor_data" binding:"required"`
	PlanType        string       `json:"plan_type" binding:"required"` // "one-time" | "subscription"
	DogID           uint         `json:"dog_id" binding:"required"`
	Amount          int64        `json:"amount" binding:"required,min=1"`
	Status          string       `json:"status"` // FE: "Active" | "Paided" | "Paid" → map ภายใน
	PaymentMethodID uint         `json:"payment_method_id" binding:"required"`
	Frequency       *string      `json:"frequency"`        // เฉพาะ subscription
	Update          *UpdatesPref `json:"update,omitempty"` // ระดับ Sponsorship (override รายดีล)
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

/* ===== DTO: GET /me/sponsorships (ไม่ paginate) ===== */

type MySponsorshipPaymentDTO struct {
	ID              uint      `json:"ID"` // เคสใหญ่ตาม gorm.Model
	Amount          int64     `json:"amount"`
	Status          string    `json:"status"`
	PaymentMethodID uint      `json:"payment_method_id"`
	CreatedAt       time.Time // ไม่มี tag → ออก "CreatedAt"
	TransactionRef  string    `json:"transaction_ref"`
}

type MySponsorshipSubscriptionDTO struct {
	ID               uint       `json:"ID"`
	Interval         string     `json:"interval"` // monthly | quarterly | yearly
	Status           string     `json:"status,omitempty"`
	NextPaymentAt    *time.Time `json:"next_payment_at,omitempty"`
	CurrentPeriodEnd *time.Time `json:"current_period_end"`
}

type MySponsorshipItemDTO struct {
	ID        uint      `json:"ID"`
	DogID     uint      `json:"dog_id"`
	PhotoURL  string    `json:"photo_url"`
	DogName   string    `json:"dog_name"`
	PlanType  string    `json:"plan_type"` // one-time | subscription
	Amount    int64     `json:"amount"`
	Status    string    `json:"status"`
	Enabled   bool      `json:"enabled"`
	Channel   *string   `json:"channel,omitempty"`   // email | sms | line | null
	Frequency *string   `json:"frequency,omitempty"` // weekly | biweekly | monthly | quarterly | null
	CreatedAt time.Time // ไม่มี tag → ออก "CreatedAt"

	PaymentCount int                           `json:"payment_count"`
	LastPayment  *MySponsorshipPaymentDTO      `json:"last_payment,omitempty"`
	Subscription *MySponsorshipSubscriptionDTO `json:"subscription,omitempty"`
}

type MySponsorshipSummaryDTO struct {
	TotalOneTime      int64 `json:"total_one_time"`
	TotalSubscription int64 `json:"total_subscription"`
	TotalAll          int64 `json:"total_all"`
}

type MySponsorshipListDTO struct {
	Items   []MySponsorshipItemDTO  `json:"items"`
	Summary MySponsorshipSummaryDTO `json:"summary"`
}

/* ===== Helpers (เฉพาะที่จำเป็นในไฟล์นี้) ===== */

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

// canonical status ของ Sponsorship: "active" / "completed"
func mapStatus(fe string, fallback string) string {
	switch norm(fe) {
	case "active":
		return "active"
	case "paided", "paid", "completed", "complete":
		return "completed"
	case "":
		return norm(fallback)
	default:
		return norm(fe)
	}
}

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

func normInterval(p *string) (string, bool) {
	if p == nil {
		return "", false
	}
	switch norm(*p) {
	case "monthly", "quarterly", "yearly", "annually":
		if norm(*p) == "annually" {
			return "yearly", true
		}
		return norm(*p), true
	default:
		return "", false
	}
}

func applySponsorshipUpdatesIfAny(sp *entity.Sponsorship, upd *UpdatesPref) {
	if upd == nil {
		return
	}
	sp.Enabled = upd.Enabled
	sp.Channel = normChannel(upd.Channel)
	sp.Frequency = normFrequency(upd.Frequency)
}

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
	genderid := sd.GenderID

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
			s.GenderID = genderid
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
func derefStr(p *string) string {
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

func safeDogName(sp entity.Sponsorship) string {
	if sp.Dog != nil {
		// สมมติ Dog.Name เป็น string (ถ้าเป็น *string ให้แก้เป็น: if sp.Dog.Name != nil { return *sp.Dog.Name })
		return sp.Dog.Name
	}
	return ""
}

/* ===== Handlers ===== */

// POST /sponsorships/one-time
func CreateOneTimeSponsorship(c *gin.Context) {
	// (optional) debug body
	body, _ := io.ReadAll(c.Request.Body)
	log.Println("🔥 Raw Body:", string(body))
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body)) // reset body

	var req SponsorshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid request",
			"details": err.Error(),
		})
		return
	}
	if mapPlanType(req.PlanType) != "one-time" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan_type must be one-time for this endpoint"})
		return
	}

	uid := getUserIDFromCtx(c)
	// validate นอก transaction
	if err := validateSponsorData(req.SponsorData, uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid sponsor_data",
			"details": err.Error(),
		})
		return
	}

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := ensureDog(tx, req.DogID); err != nil {
			return err
		}
		if err := ensurePaymentMethod(tx, req.PaymentMethodID); err != nil {
			return err
		}

		sponsor, err := findOrCreateSponsor(tx, req.SponsorData, uid)
		if err != nil {
			return err
		}

		status := mapStatus(req.Status, "completed")
		sp := entity.Sponsorship{
			SponsorID: sponsor.ID,
			DogID:     req.DogID,
			PlanType:  "one-time",
			Amount:    req.Amount,
			Status:    &status,
		}
		applySponsorshipUpdatesIfAny(&sp, req.Update)

		if err := tx.Create(&sp).Error; err != nil {
			return err
		}

		pmt := entity.SponsorshipPayment{
			SponsorshipID:   sp.ID,
			PaymentMethodID: req.PaymentMethodID,
			Amount:          sp.Amount,
			Status:          "SUCCEEDED",
			TransactionRef:  mockTxnRef("OT"), // ใช้ helper จากไฟล์ txn_ref.go
		}
		if err := tx.Create(&pmt).Error; err != nil {
			return err
		}

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

	interval, ok := normInterval(req.Frequency)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid frequency"})
		return
	}

	// validate นอก transaction
	if err := validateSponsorData(req.SponsorData, uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid sponsor_data",
			"details": err.Error(),
		})
		return
	}

	db := configs.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := ensureDog(tx, req.DogID); err != nil {
			return err
		}
		if err := ensurePaymentMethod(tx, req.PaymentMethodID); err != nil {
			return err
		}

		sponsor, err := findOrCreateSponsor(tx, req.SponsorData, uid)
		if err != nil {
			return err
		}

		status := mapStatus(req.Status, "active")
		sp := entity.Sponsorship{
			SponsorID: sponsor.ID,
			DogID:     req.DogID,
			PlanType:  "subscription",
			Amount:    req.Amount,
			Status:    &status,
		}
		applySponsorshipUpdatesIfAny(&sp, req.Update)

		if err := tx.Create(&sp).Error; err != nil {
			return err
		}

		sub := entity.Subscription{
			SponsorshipID: sp.ID,
			Amount:        sp.Amount,
			Interval:      interval, // normalized
			Status:        "active",
			// StartDate/CancelAt: เติมถ้าต้องการ
		}
		if err := tx.Create(&sub).Error; err != nil {
			return err
		}

		pmt := entity.SponsorshipPayment{
			SponsorshipID:   sp.ID,
			SubscriptionID:  &sub.ID,
			PaymentMethodID: req.PaymentMethodID,
			Amount:          sp.Amount,
			Status:          "SUCCEEDED",
			TransactionRef:  mockTxnRef("SUB"),
		}
		if err := tx.Create(&pmt).Error; err != nil {
			return err
		}

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

/* ===== GET /me/sponsorships ===== */

func GetMySponsorships(c *gin.Context) {
	uid := getUserIDFromCtx(c)
	if uid == nil || *uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	db := configs.DB()

	// -------------------------------
	// 1) ดึงรายการของผู้ใช้
	// -------------------------------
	var sps []entity.Sponsorship
	if err := db.
		Preload("Dog").
		Preload("Subscription").
		Preload("SponsorshipPayments", func(tx *gorm.DB) *gorm.DB {
			// เรียงล่าสุดก่อน (จะหยิบ last payment ได้สะดวก)
			return tx.Order("sponsorship_payments.id DESC")
		}).
		Preload("SponsorshipPayments.PaymentMethod").
		Joins("JOIN sponsors s ON s.id = sponsorships.sponsor_id").
		Where("s.kind = ? AND s.user_id = ?", entity.SponsorKindUser, *uid).
		Order("sponsorships.id DESC").
		Find(&sps).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, MySponsorshipListDTO{
				Items:   []MySponsorshipItemDTO{},
				Summary: MySponsorshipSummaryDTO{},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// -------------------------------
	// map -> items (คำนวณ period_end / next_payment_at)
	// -------------------------------
	items := make([]MySponsorshipItemDTO, 0, len(sps))
	for _, sp := range sps {
		item := MySponsorshipItemDTO{
			ID:        sp.ID,
			DogID:     sp.DogID,
			DogName:   safeDogName(sp),
			PhotoURL:  sp.Dog.PhotoURL,
			PlanType:  sp.PlanType,
			Amount:    sp.Amount,
			Status:    derefStr(sp.Status),
			Enabled:   sp.Enabled,
			Channel:   sp.Channel,
			Frequency: sp.Frequency,
			CreatedAt: sp.CreatedAt,
		}

		// ----- last payment (ล่าสุดของรายการนี้) -----
		if len(sp.SponsorshipPayments) > 0 {
			lp := sp.SponsorshipPayments[0] // DESC แล้ว
			item.PaymentCount = len(sp.SponsorshipPayments)
			item.LastPayment = &MySponsorshipPaymentDTO{
				ID:              lp.ID,
				Amount:          lp.Amount,
				Status:          lp.Status,
				PaymentMethodID: lp.PaymentMethodID,
				CreatedAt:       lp.CreatedAt,
				TransactionRef:  lp.TransactionRef,
			}
		}

		// ----- subscription summary -----
		if sp.Subscription != nil {
			// หา "จ่ายล่าสุดของ subscription นี้" เพื่อเป็น anchor
			var anchor time.Time
			// เริ่มจาก StartDate; ว่างให้ถอยไปใช้ CreatedAt
			if !sp.Subscription.StartDate.IsZero() {
				anchor = sp.Subscription.StartDate
			} else {
				anchor = sp.CreatedAt
			}
			// ถ้ามี payment ที่สำเร็จของ subscription เดียวกัน ให้ใช้ตอนนั้นเป็น anchor
			for _, p := range sp.SponsorshipPayments {
				if p.SubscriptionID != nil && *p.SubscriptionID == sp.Subscription.ID && strings.EqualFold(p.Status, "SUCCEEDED") {
					anchor = p.CreatedAt
					break
				}
			}

			// current_period_end = anchor + interval (เสมอ)
			cpe := addInterval(anchor, sp.Subscription.Interval)
			var nextPtr *time.Time
			// next_payment_at แสดงเฉพาะกรณีไม่ยกเลิก
			if !strings.EqualFold(sp.Subscription.Status, "canceled") {
				nextPtr = &cpe
			}

			item.Subscription = &MySponsorshipSubscriptionDTO{
				ID:               sp.Subscription.ID,
				Interval:         sp.Subscription.Interval,
				Status:           sp.Subscription.Status,
				NextPaymentAt:    nextPtr, // ถ้ายกเลิก = nil
				CurrentPeriodEnd: &cpe,    // ใช้เช็คสิทธิ์ reactivate ได้จนถึงวันนี้
			}
		}

		items = append(items, item)
	}

	// -------------------------------
	// 2) SUMMARY: รวมยอด "ที่จ่ายจริง" จาก SponsorPayments
	//    (ไม่นับสถานะอื่น นับเฉพาะที่สำเร็จ)
	// -------------------------------
	paidStatuses := []string{"SUCCEEDED", "PAID", "COMPLETED"}

	var summary MySponsorshipSummaryDTO
	if err := db.
		Model(&entity.SponsorshipPayment{}).
		Joins("JOIN sponsorships sp ON sp.id = sponsorship_payments.sponsorship_id").
		Joins("JOIN sponsors s ON s.id = sp.sponsor_id").
		Where("s.kind = ? AND s.user_id = ?", entity.SponsorKindUser, *uid).
		Where("sponsorship_payments.status IN ?", paidStatuses).
		Select(`
            COALESCE(SUM(CASE WHEN sp.plan_type = 'one-time'     THEN sponsorship_payments.amount ELSE 0 END), 0) AS total_one_time,
            COALESCE(SUM(CASE WHEN sp.plan_type = 'subscription' THEN sponsorship_payments.amount ELSE 0 END), 0) AS total_subscription,
            COALESCE(SUM(sponsorship_payments.amount), 0) AS total_all
        `).
		Scan(&summary).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, MySponsorshipListDTO{
		Items:   items,
		Summary: summary,
	})
}
