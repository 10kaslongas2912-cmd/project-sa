package users

import (
	"errors"
	"net/http"
	"time"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type (
	Authen struct {
		UserName string `json:"username"`
		Password string `json:"password"`
	}

	signUp struct {
		FirstName   string    `json:"first_name"`
		LastName    string    `json:"last_name"`
		Email       string    `json:"email"`
		PhoneNumber string    `json:"phone_number"`
		Password    string    `json:"password"`
		DateOfBirth time.Time `json:"date_of_birth"`
		GenderID    *uint     `json:"gender_id"`
		UserName    string    `json:"username"`
	}
)

func SignUp(c *gin.Context) {
	var payload signUp
	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	var userCheck entity.User

	// Check if the user with the provided email already exists
	result := db.Where("email = ?", payload.Email).First(&userCheck)
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// If there's a database error other than "record not found"
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if userCheck.UserID != 0 {
		// If the user with the provided email already exists
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
		return
	}

	// Hash the user's password
	hashedPassword, _ := services.HashPassword(payload.Password)
	// Create a new user
	user := entity.User{
		FirstName:   payload.FirstName,
		LastName:    payload.LastName,
		Email:       payload.Email,
		PhoneNumber: payload.PhoneNumber,
		UserName:    payload.UserName,
		Password:    hashedPassword,
		DateOfBirth: payload.DateOfBirth,
		GenderID:    payload.GenderID,
	}
	// Save the user to the database
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})
}

func SignIn(c *gin.Context) {
	var payload Authen
	var user entity.User
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา
	if err := config.DB().Raw("SELECT * FROM users WHERE user_name = ?", payload.UserName).Scan(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบรหัสผ่าน
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})
		return
	}
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.UserName)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.UserID})
}