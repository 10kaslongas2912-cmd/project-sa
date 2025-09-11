package staff

import (
	"net/http"
	"strings"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ============ Helpers ============ */

func staffResp(s entity.Staff) gin.H {
	return gin.H{
		"id":            s.ID,
		"username":      s.Username,
		"first_name":    s.FirstName,
		"last_name":     s.LastName,
		"email":         s.Email,
		"phone":         s.Phone,
		"date_of_birth": s.DateOfBirth,
		"photo_url":     s.PhotoURL,
		"note":          s.Note,
		"status":        s.Status,
		"gender":        s.Gender, // object
		"zone":          s.Zone,   // object
	}
}

/* ============ READ (Get all) ============ */
func GetAllStaffs(c *gin.Context) {
	var staffs []entity.Staff
	if err := configs.DB().
		Preload("Zone").
		Preload("Gender").
		Find(&staffs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch staffs"})
		return
	}
	c.JSON(http.StatusOK, staffs)
}

/* ============ READ (Get by ID) ============ */
func GetStaffById(c *gin.Context) {
	id := c.Param("id")
	var s entity.Staff
	if err := configs.DB().
		Preload("Zone").
		Preload("Gender").
		First(&s, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "staff not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, s)
}

/* ============ UPDATE ============ */
type UpdateStaffRequest struct {
	Username    *string `json:"username" binding:"required"`
	Password    *string `json:"password"` // optional; ถ้าส่งมาจะอัปเดต (hash ให้)
	FirstName   *string `json:"first_name" binding:"required"`
	LastName    *string `json:"last_name" binding:"required"`
	Email       *string `json:"email"`
	Phone       *string `json:"phone"`
	DateOfBirth *string `json:"date_of_birth"`
	PhotoURL    *string `json:"photo_utl"`
	Note        *string `json:"note"`
	ZoneID      *uint   `json:"zone_id" binding:"required,gt=0"`
	GenderID    *uint   `json:"gender_id" binding:"required,gt=0"`
	Status      *string `json:"status"`
}

func UpdateStaff(c *gin.Context) {
	id := c.Param("id")

	var s entity.Staff
	if err := configs.DB().First(&s, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "staff not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var req UpdateStaffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.Username = strings.TrimSpace(*req.Username)
	s.FirstName = *req.FirstName
	s.LastName = *req.LastName
	s.Email = strings.ToLower(strings.TrimSpace(*req.Email))
	s.Phone = *req.Phone
	s.DateOfBirth = *req.DateOfBirth
	s.Note = req.Note
	s.ZoneID = *req.ZoneID
	s.GenderID = *req.GenderID
	s.Status = req.Status

	// ถ้าส่ง password มาใหม่ ให้ hash ก่อนเก็บ
	if req.Password != nil {
		hashed, err := services.HashPassword(*req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password failed"})
			return
		}
		s.Password = hashed
	}

	if err := configs.DB().Save(&s).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update staff"})
		return
	}

	// preload กลับก่อนตอบ
	if err := configs.DB().
		Preload("Zone").
		Preload("Gender").
		First(&s, s.ID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "staff updated", "data": s})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "staff updated successfully", "data": s})
}

/* ============ DELETE ============ */
func DeleteStaff(c *gin.Context) {
	id := c.Param("id")
	if err := configs.DB().Delete(&entity.Staff{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete staff"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "staff deleted successfully"})
}

/* ============ ME (โปรไฟล์พนักงานที่ล็อกอิน) ============ */
func Me(c *gin.Context) {
	// ตรวจ kind ต้องเป็น staff เท่านั้น
	if k, ok := c.Get("kind"); ok {
		if ks, ok2 := k.(string); ok2 && ks != "staff" {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
	}

	db := configs.DB()
	var s entity.Staff
	var err error

	// ใช้ staff_id ก่อน
	if v, ok := c.Get("staff_id"); ok {
		if id, ok2 := v.(uint); ok2 && id != 0 {
			err = db.Preload("Gender").Preload("Zone").First(&s, id).Error
			returnMe(c, s, err)
			return
		}
	}
	// fallback เผื่อ token เก่า
	if v, ok := c.Get("staff_username"); ok {
		if uname, ok2 := v.(string); ok2 && uname != "" {
			err = db.Preload("Gender").Preload("Zone").Where("username = ?", uname).First(&s).Error
			returnMe(c, s, err)
			return
		}
	}
	if v, ok := c.Get("staff_email"); ok {
		if mail, ok2 := v.(string); ok2 && mail != "" {
			err = db.Preload("Gender").Preload("Zone").
				Where("email = ?", strings.ToLower(strings.TrimSpace(mail))).First(&s).Error
			returnMe(c, s, err)
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
}

func returnMe(c *gin.Context, s entity.Staff, err error) {
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "staff not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, staffResp(s))
}
