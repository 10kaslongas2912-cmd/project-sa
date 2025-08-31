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
	Email    string `json:"email"    binding:"omitempty,email"`
	Username string `json:"username" binding:"omitempty"` // ใช้ username เป็นหลัก แต่ให้เว้นว่างได้ ถ้าจะล็อกอินด้วย email
	Password string `json:"password" binding:"required"`
}

type SignUpRequest struct {
	Firstname   string `json:"firstname"    binding:"required"`
	Lastname    string `json:"lastname"     binding:"required"`
	Email       string `json:"email"        binding:"required,email"`
	Phone       string `json:"phone"`
	DateOfBirth string `json:"date_of_birth" binding:"required"` // "YYYY-MM-DD"
	GenderID    uint   `json:"gender_id"    binding:"required"`
	Username    string `json:"username"     binding:"required"`
	Password    string `json:"password"     binding:"required"`
}

/* ===== Helpers ===== */

// parse "YYYY-MM-DD"
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
		DateOfBirth: req.DateOfBirth, // หาก entity.User ใช้ time.Time ให้แปลงก่อน
		GenderID:    req.GenderID,
	}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	// preload ความสัมพันธ์ตอบกลับ
	var out entity.User
	if err := db.Preload("Gender").First(&out, user.ID).Error; err != nil {
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

	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var user entity.User
	db := configs.DB()

	// ล็อกอินด้วย username เป็นหลัก; ถ้าไม่ส่ง username มาแต่ส่ง email ก็ใช้ email
	var err error
	if req.Username != "" {
		err = db.Where("username = ?", req.Username).First(&user).Error
	} else if req.Email != "" {
		err = db.Where("email = ?", req.Email).First(&user).Error
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

	// ตรวจสอบรหัสผ่าน
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username/email or password"})
		return
	}

	// ออก token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx", // TODO: ย้ายไป ENV
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	var signedToken string
	// ถ้าคุณเพิ่มเมธอดใหม่ใน service แล้ว (แนะนำ): ใส่ทั้ง id + username + email
	//   func (j *JwtWrapper) GenerateTokenForUser(userID uint, username, email string) (string, error)
	if generateForUser, ok := any(&jwtWrapper).(interface {
		GenerateTokenForUser(uint, string, string) (string, error)
	}); ok {
		signedToken, err = generateForUser.GenerateTokenForUser(user.ID, user.Username, user.Email)
	} else {
		// Fallback: ใช้ของเดิมที่รับ string เดียว (เดิมคุณรับ email; ถ้าของเดิมยังรับ email ให้เปลี่ยนเป็น user.Email)
		signedToken, err = jwtWrapper.GenerateToken(user.ID,user.Username,user.Email)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error signing token"})
		return
	}

	// preload user สำหรับตอบกลับ
	var out entity.User
	if err := db.Preload("Gender").First(&out, user.ID).Error; err != nil {
		out = user
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"token_type": "Bearer",
			"token":      signedToken,
			"user": gin.H{
				"ID":        out.ID,        // ใช้ gorm.Model => ฟิลด์ ID ใหญ่
				"username":  out.Username,
				"firstname": out.Firstname,
				"lastname":  out.Lastname,
				"email":     out.Email,
				"phone":     out.Phone,
				"gender":    out.Gender, // ถ้า entity.Gender มี json tag ถูก จะ serialize เป็น object
			},
		},
	})
}
