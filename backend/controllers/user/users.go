package user

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/* ===== DTOs (ตามที่คุณมีอยู่) ===== */

type CreateUserRequest struct {
	Firstname   string  `json:"first_name"`
	Lastname    string  `json:"last_name"`
	DateOfBirth string  `json:"date_of_birth"`
	Email       string  `gorm:"uniqueIndex" json:"email"`
	Phone       string  `json:"phone"`
	Username    string  `gorm:"uniqueIndex" json:"username"`
	Password    string  `json:"-"`
	PhotoURL    *string `json:"photo_url"`
	GenderID    uint    `json:"gender_id"`
}

type UpdateUserRequest struct {
	Firstname   *string `json:"first_name"`
	Lastname    *string `json:"last_name"`
	DateOfBirth *string `json:"date_of_birth"` // "YYYY-MM-DD"
	Email       *string `json:"email"`
	Phone       *string `json:"phone"`
	Username    *string `json:"username"`
	Password    *string `json:"password"`
	PhotoURL    *string `json:"photo_url"`
	GenderID    *uint   `json:"gender_id"`
}

/* ===== Helpers ===== */

func parseDateYMD(s string) (time.Time, error) {
	// ถ้า entity.User ใช้ string สำหรับวันเกิด ก็ไม่ต้องใช้ตัวนี้
	return time.Parse("2006-01-02", s)
}

func userResp(u entity.User) gin.H {
	FullName := strings.TrimSpace(u.FirstName + " " + u.LastName)
	return gin.H{
		"ID":        u.ID, 
		"name":      FullName,
		"first_name": u.FirstName,
		"last_name":  u.LastName,
		"username":  u.Username,
		"email":     u.Email,
		"phone":     u.Phone,
		"photo_url": u.PhotoURL,
		"gender":    u.Gender,   
		"createdAt": u.CreatedAt, 
		"updatedAt": u.UpdatedAt,
	}
}

/* ===== Handlers ===== */

func Me(c *gin.Context) {
	uidAny, _ := c.Get("user_id")
	unameAny, _ := c.Get("username")
	emailAny, _ := c.Get("user_email")

	db := configs.DB()
	var u entity.User
	var err error

	switch {
	case uidAny != nil:
		if uid, ok := uidAny.(uint); ok && uid != 0 {
			err = db.Preload("Gender").First(&u, uid).Error
		}
	case unameAny != nil:
		if uname, ok := unameAny.(string); ok && uname != "" {
			err = db.Preload("Gender").Where("username = ?", uname).First(&u).Error
		}
	case emailAny != nil:
		if mail, ok := emailAny.(string); ok && mail != "" {
			err = db.Preload("Gender").Where("email = ?", mail).First(&u).Error
		}
	default:
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, userResp(u))
}

func GetAllUsers(c *gin.Context) {
	db := configs.DB()
	var users []entity.User

	// (optional) รองรับ page/limit แบบเบา ๆ
	limitStr := c.DefaultQuery("limit", "100")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	tx := db.Preload("Gender").Limit(limit).Offset(offset).Find(&users)
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}

	// map response ชัด ๆ
	out := make([]gin.H, 0, len(users))
	for _, u := range users {
		out = append(out, userResp(u))
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   out,
		"limit":  limit,
		"offset": offset,
		"count":  len(out),
	})
}

func GetUserById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	db := configs.DB()
	var u entity.User
	if err := db.Preload("Gender").First(&u, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, userResp(u))
}

func UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	db := configs.DB()

	// โหลดของเดิม
	var u entity.User
	if err := db.First(&u, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// bind DTO (ไม่ bind ทับ entity ตรง ๆ)
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request: " + err.Error()})
		return
	}

	// sanitize + apply ทีละฟิลด์
	updates := map[string]any{}

	if req.Firstname != nil {
		updates["firstname"] = strings.TrimSpace(*req.Firstname)
	}
	if req.Lastname != nil {
		updates["lastname"] = strings.TrimSpace(*req.Lastname)
	}
	if req.Email != nil {
		email := strings.TrimSpace(strings.ToLower(*req.Email))
		if email != "" && email != u.Email {
			// ตรวจซ้ำ
			var cnt int64
			if err := db.Model(&entity.User{}).Where("email = ?", email).Where("id <> ?", u.ID).Count(&cnt).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if cnt > 0 {
				c.JSON(http.StatusConflict, gin.H{"error": "email is already in use"})
				return
			}
			updates["email"] = email
		}
	}
	if req.Username != nil {
		username := strings.TrimSpace(*req.Username)
		if username != "" && username != u.Username {
			var cnt int64
			if err := db.Model(&entity.User{}).Where("username = ?", username).Where("id <> ?", u.ID).Count(&cnt).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if cnt > 0 {
				c.JSON(http.StatusConflict, gin.H{"error": "username is already taken"})
				return
			}
			updates["username"] = username
		}
	}
	if req.Phone != nil {
		updates["phone"] = strings.TrimSpace(*req.Phone)
	}
	if req.PhotoURL != nil {
		updates["photo_url"] = req.PhotoURL // อนุญาต null ได้
	}
	if req.GenderID != nil {
		updates["gender_id"] = *req.GenderID
	}
	if req.DateOfBirth != nil {
		dobStr := strings.TrimSpace(*req.DateOfBirth)
		if dobStr != "" {
			// ถ้า entity.User เก็บเป็น string ก็ set ตรง ๆ
			// updates["date_of_birth"] = dobStr
			// ถ้า entity.User เก็บเป็น time.Time ให้ parse ก่อน:
			if _, err := parseDateYMD(dobStr); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth (YYYY-MM-DD)"})
				return
			}
			updates["date_of_birth"] = dobStr
		}
	}
	if req.Password != nil {
		pw := strings.TrimSpace(*req.Password)
		if pw != "" {
			hashed, err := bcrypt.GenerateFromPassword([]byte(pw), 14)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password failed"})
				return
			}
			updates["password"] = string(hashed)
		}
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	if err := db.Model(&u).Updates(updates).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// reload พร้อม Preload
	if err := db.Preload("Gender").First(&u, u.ID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "updated", "user": updates})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated", "user": userResp(u)})
}

func DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	db := configs.DB()
	// ใช้ GORM ลบปกติ (จะ soft delete ถ้า model มี gorm.DeletedAt)
	if err := db.Delete(&entity.User{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
