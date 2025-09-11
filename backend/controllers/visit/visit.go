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

	// ส่ง HTTP 201 สำหรับการสร้างสำเร็จ
	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างการเยี่ยมชมเรียบร้อยแล้ว",
	})
}

// --- Get (GET /visits/:id) ---
func GetVisit(c *gin.Context) {
	id := c.Param("id")
	db := configs.DB()

	var visit entity.Visit
	if err := db.Preload("VisitDetails.Dog").First(&visit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลการเยี่ยมชม"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": visit})
}

// --- Update (PUT /visits/:id) ---
// --- Update Alternative Version (PUT /visits/:id) ---
func UpdateVisit(c *gin.Context) {
	id := c.Param("id")
	var req CreateVisitRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.EndAt.Before(req.StartAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น"})
		return
	}

	db := configs.DB()
	
	// ใช้ multiple transactions แทน single transaction
	var visit entity.Visit
	if err := db.First(&visit, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการเยี่ยมชม"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		return
	}

	// ตรวจสอบว่าสุนัขมีจริงทั้งหมด
	var dogs []entity.Dog
	if err := db.Where("id IN ?", req.DogIDs).Find(&dogs).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถดึงข้อมูลสุนัขได้"})
		return
	}
	if len(dogs) != len(req.DogIDs) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "มีน้องหมาบางตัวไม่พบในระบบ"})
		return
	}

	// อัพเดทข้อมูล visit ก่อน
	visit.VisitName = req.VisitName
	visit.StartAt = req.StartAt
	visit.EndAt = req.EndAt
	if err := db.Save(&visit).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถอัพเดทข้อมูลการเยี่ยมชมได้"})
		return
	}

	// ลบ VisitDetails เดิมทั้งหมด (ใช้ raw SQL เพื่อความแน่ใจ)
	if err := db.Exec("DELETE FROM visit_details WHERE visit_id = ?", visit.ID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถลบข้อมูลเดิมได้"})
		return
	}

	// เพิ่ม VisitDetails ใหม่ทีละตัว
	for _, dogID := range req.DogIDs {
		visitDetail := entity.VisitDetail{
			VisitID: visit.ID,
			DogID:   dogID,
		}
		if err := db.Create(&visitDetail).Error; err != nil {
			// หากเกิดข้อผิดพลาด ให้ลบ visit details ที่เพิ่มไปแล้วและ rollback
			db.Exec("DELETE FROM visit_details WHERE visit_id = ?", visit.ID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถเพิ่มข้อมูลน้องหมาได้: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัพเดทการเยี่ยมชมเรียบร้อยแล้ว"})
}
// --- Delete (DELETE /visits/:id) ---
func DeleteVisit(c *gin.Context) {
	id := c.Param("id")
	db := configs.DB()

	err := db.Transaction(func(tx *gorm.DB) error {
		// ตรวจสอบว่า Visit มีอยู่จริงหรือไม่
		var visit entity.Visit
		if err := tx.First(&visit, id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("ไม่พบการเยี่ยมชมที่ต้องการลบ")
			}
			return err
		}

		// ลบ VisitDetails ก่อน
		if err := tx.Where("visit_id = ?", id).Delete(&entity.VisitDetail{}).Error; err != nil {
			return err
		}

		// ลบ Visit
		if err := tx.Delete(&entity.Visit{}, id).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		// ตรวจสอบประเภทของ error เพื่อส่ง status code ที่เหมาะสม
		if err.Error() == "ไม่พบการเยี่ยมชมที่ต้องการลบ" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลได้"})
		}
		return
	}

	// ส่ง HTTP 200 หรือ 204 สำหรับการลบสำเร็จ
	c.JSON(http.StatusOK, gin.H{"message": "ลบการเยี่ยมชมเรียบร้อยแล้ว"})
}

// GET /visits - ดึงข้อมูลการเยี่ยมชมทั้งหมด
func GetAllVisits(c *gin.Context) {
    db := configs.DB()

    var visits []entity.Visit
    if err := db.Preload("VisitDetails").
        Preload("VisitDetails.Dog").
        Preload("VisitDetails.Dog.AnimalSex").
        Preload("VisitDetails.Dog.Breed").
        Find(&visits).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการเยี่ยมชมได้"})
        return
    }

    // แปลงข้อมูลให้ตรงกับ Frontend
    var result []map[string]interface{}
    for _, visit := range visits {
        var dogs []interface{}
        for _, vd := range visit.VisitDetails {
            if vd.Dog != nil {
                dogs = append(dogs, map[string]interface{}{
                    "ID":            vd.Dog.ID,
                    "name":          vd.Dog.Name,
                    "photo_url":     vd.Dog.PhotoURL,
                    "date_of_birth": vd.Dog.DateOfBirth,
                    "animal_sex":    vd.Dog.AnimalSex,
                    "breed":         vd.Dog.Breed,
                })
            }
        }
        
        visitData := map[string]interface{}{
            "ID":         visit.ID,
            "visit_name": visit.VisitName,
            "start_at":   visit.StartAt,
            "end_at":     visit.EndAt,
            "created_at": visit.CreatedAt,
            "dogs":       dogs,
        }
        result = append(result, visitData)
    }

    c.JSON(http.StatusOK, result)
}