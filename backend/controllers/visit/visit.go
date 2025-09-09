package visit

import (
	"errors"
	"net/http"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// --- DTO (Data Transfer Object) ---
type CreateVisitRequest struct {
	VisitName string    `json:"visit_name" binding:"required"`
	StartAt   time.Time `json:"start_at" binding:"required"`
	EndAt     time.Time `json:"end_at" binding:"required"`
	DogIDs    []uint    `json:"dog_ids" binding:"required,min=1,dive,gt=0"`
}

// --- Controller Function ---
// POST /visits
func CreateVisit(c *gin.Context) {
	var req CreateVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า EndAt >= StartAt
	if req.EndAt.Before(req.StartAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น"})
		return
	}

	db := configs.DB()

	// ใช้ Transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		// ตรวจสอบว่าสุนัขมีจริงทั้งหมด
		var dogs []entity.Dog
		if err := tx.Where("id IN ?", req.DogIDs).Find(&dogs).Error; err != nil {
			return errors.New("ไม่สามารถดึงข้อมูลสุนัขได้")
		}
		if len(dogs) != len(req.DogIDs) {
			return errors.New("มีน้องหมาบางตัวไม่พบในระบบ")
		}

		// สร้าง Visit
		visit := entity.Visit{
			VisitName: req.VisitName,
			StartAt:   req.StartAt,
			EndAt:     req.EndAt,
		}
		if err := tx.Create(&visit).Error; err != nil {
			return err
		}

		// สร้าง VisitDetail อัตโนมัติ
		for _, dogID := range req.DogIDs {
			visitDetail := entity.VisitDetail{
				VisitID: visit.ID,
				DogID:   dogID,
			}
			if err := tx.Create(&visitDetail).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "สร้างการเยี่ยมชมเรียบร้อยแล้ว",
	})
}
