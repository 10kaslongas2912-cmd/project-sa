// controllers/auth/staff.go
package staff

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/* ===== DTOs ===== */

type StaffLoginRequest struct {
	Email    string `json:"email"    binding:"omitempty,email"`
	Username string `json:"username" binding:"omitempty"`
	Password string `json:"password" binding:"required"`
}

type StaffSignUpRequest struct {
	FirstName   string `json:"first_name"    binding:"required"`
	LastName    string `json:"last_name"     binding:"required"`
	Email       string `json:"email"        binding:"required,email"`
	Phone       string `json:"phone"`
	DateOfBirth string `json:"date_of_birth" binding:"required"` // YYYY-MM-DD
	GenderID    uint   `json:"gender_id"    binding:"required"`
	Username    string `json:"username"     binding:"required"`
	Password    string `json:"password"     binding:"required"`

	// ข้อมูล staff เพิ่มเติม (ยังใช้ แต่ไม่ได้ใช้เพื่อ auth)
	RoleID uint    `json:"role_id"` // ถ้าไม่ใช้ตอนนี้จะเป็น 0 ได้
	ZoneID uint    `json:"zone_id"`
	Note   *string `json:"note"`
	Status *string `json:"status"`
}

/* ===== Helpers ===== */

func isYMD(s string) bool {
	_, err := time.Parse("2006-01-02", s)
	return err == nil
}

/* ===== Handlers ===== */

// POST /api/staff/signup
func StaffSignUp(c *gin.Context) {
	var req StaffSignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Username = strings.TrimSpace(req.Username)

	db := configs.DB()

	// ตรวจซ้ำ username/email
	var exists entity.Staff
	if err := db.Where("username = ?", req.Username).First(&exists).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "username is already taken"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := db.Where("email = ?", req.Email).First(&exists).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email is already registered"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !isYMD(req.DateOfBirth) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth (YYYY-MM-DD)"})
		return
	}

	// hash password
	hashed, err := services.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password failed"})
		return
	}

	st := entity.Staff{
		Username:     req.Username,
		Password:     hashed,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		Phone:        req.Phone,
		DateOfBirth:  req.DateOfBirth,
		GenderID:     req.GenderID,
		ZoneID:       req.ZoneID,
		Note:         req.Note,
		Status:       req.Status,
	}

	if err := db.Create(&st).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	// preload ตอบกลับ
	var out entity.Staff
	if err := db.Preload("Gender").Preload("Role").Preload("Zone").First(&out, st.ID).Error; err != nil {
		c.JSON(http.StatusCreated, gin.H{"data": st})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": out})
}

// POST /api/staff/signin
func StaffSignIn(c *gin.Context) {
	var req StaffLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var st entity.Staff
	db := configs.DB()

	// login ด้วย username เป็นหลัก รองรับ email
	var err error
	if req.Username != "" {
		err = db.Where("username = ?", req.Username).First(&st).Error
	} else if req.Email != "" {
		err = db.Where("email = ?", req.Email).First(&st).Error
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username or email is required"})
		return
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username/email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ตรวจรหัสผ่าน
	if bcrypt.CompareHashAndPassword([]byte(st.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username/email or password"})
		return
	}

	// ออก token (kind=staff)
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx", // TODO: ย้าย ENV
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	signedToken, err := jwtWrapper.GenerateStaffToken(st.ID, st.Username, st.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error signing token"})
		return
	}

	// preload ตอบกลับ
	var out entity.Staff
	if err := db.Preload("Gender").Preload("Zone").First(&out, st.ID).Error; err != nil {
		out = st
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      signedToken,
		"staff": gin.H{
			"id":           out.ID,
			"username":     out.Username,
			"first_name":   out.FirstName,
			"last_name":    out.LastName,
			"email":        out.Email,
			"phone":        out.Phone,
			"gender":       out.Gender,
			"zone":         out.Zone,
			"date_of_birth": out.DateOfBirth,
			"note":         out.Note,
			"status":       out.Status,
		},
	})
}
