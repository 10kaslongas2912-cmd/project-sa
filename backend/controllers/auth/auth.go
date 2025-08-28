package auth

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

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SignUpRequest struct {
	Firstname   string `json:"firstname" binding:"required"`
	Lastname    string `json:"lastname"  binding:"required"`
	Email       string `json:"email"     binding:"required,email"`
	Phone       string `json:"phone"`
	DateOfBirth string `json:"date_of_birth" binding:"required"` // "YYYY-MM-DD"
	GenderID    uint  `json:"gender_id" binding:"required"`
	Username    string `json:"username"  binding:"required"`
	Password    string `json:"password"  binding:"required"`
}

/* ===== Helpers ===== */

// parse "YYYY-MM-DD" -> time.Time (UTC, เวลา 00:00)
func isYMD(s string) bool {
	_, err := time.Parse("2006-01-02", s)
	return err == nil
}

/* ===== Handlers ===== */

func SignUp(c *gin.Context) {
	var req SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	// ปรับรูปแบบเบื้องต้น
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Username = strings.TrimSpace(req.Username)

	// ตรวจ username/email ซ้ำ
	db := configs.DB()
	var exists entity.User

	if err := db.Where("username = ?", req.Username).First(&exists).Error; err == nil {
		// พบเรคคอร์ด -> ซ้ำ
		c.JSON(http.StatusConflict, gin.H{"error": "username is already taken"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		// เกิด error อื่น
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

	// แฮชรหัสผ่าน
	hashed, err := services.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password failed"})
		return
	}

	// บันทึก
	user := entity.User{
		Firstname:   req.Firstname,
		Lastname:    req.Lastname,
		Email:       req.Email,
		Phone:       req.Phone,
		Username:    req.Username,
		Password:    hashed,
		DateOfBirth: req.DateOfBirth, // entity.User ควรเป็น time.Time
		GenderID:    req.GenderID,    // *uint ใน entity จะดีถ้าต้อง null ได้
	}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	// preload ความสัมพันธ์ตอบกลับ
	var out entity.User
	if err := db.Preload("Gender").First(&out, user.ID).Error; err != nil {
		// fallback ถ้า preload ไม่ได้
		c.JSON(http.StatusCreated, gin.H{"data": user})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": out})
}

func SignIn(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	var user entity.User
	// ใช้ GORM ปกติ ชื่่อคอลัมน์ดีฟอลต์คือ "username"
	if err := configs.DB().Where("username = ?", req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	// ออก token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx", // ควรย้ายไป ENV
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	signedToken, err := jwtWrapper.GenerateToken(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error signing token"})
		return
	}

	// preload user สำหรับตอบกลับ (ให้ FE เก็บชื่อ/รูป)
	var out entity.User
	if err := configs.DB().Preload("Gender").First(&out, user.ID).Error; err != nil {
		out = user
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"token_type": "Bearer",
			"token":      signedToken,
			"user": gin.H{
				"id":        out.ID,
				"username":  out.Username,
				"firstname": out.Firstname,
				"lastname":  out.Lastname,
				"email":     out.Email,
				"phone":     out.Phone,
				"gender":    out.Gender, // {id,name} ถ้า entity.Gender มี json tag ถูก
			},
		},
	})
}
