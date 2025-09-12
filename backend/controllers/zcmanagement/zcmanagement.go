package zcmanagement

import (
	"net/http"
	"strconv"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type dogRef struct {
	DogID uint `json:"dog_id" form:"dog_id"`
}

func parseIDs(c *gin.Context) (kennelID uint, dogID uint, ok bool) {
	// path param
	kidStr := c.Param("kennel_id")
	kid64, err := strconv.ParseUint(kidStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid kennel_id path param"})
		return 0, 0, false
	}
	kennelID = uint(kid64)

	// try to get dog_id from query or body
	var req dogRef
	if qs := c.Query("dog_id"); qs != "" {
		if v, err := strconv.ParseUint(qs, 10, 64); err == nil {
			req.DogID = uint(v)
		}
	}
	if req.DogID == 0 {
		_ = c.ShouldBind(&req) // form or query
		if req.DogID == 0 {
			_ = c.ShouldBindJSON(&req)
		} // json body
	}
	if req.DogID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "dog_id is required"})
		return 0, 0, false
	}
	return kennelID, req.DogID, true
}

// PUT /kennel/:kennel_id/dog   { dog_id }
func UpdateDogInKennel(c *gin.Context) {
	kennelID, dogID, ok := parseIDs(c)
	if !ok {
		return
	}

	// ensure the kennel exists (optional but nice)
	var k entity.Kennel
	if err := configs.DB().First(&k, kennelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "kennel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "kennel query failed: " + err.Error()})
		return
	}

	res := configs.DB().Model(&entity.Dog{}).
		Where("id = ?", dogID).
		Update("kennel_id", kennelID)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "assign failed: " + res.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": res.RowsAffected, "dog_id": dogID, "kennel_id": kennelID})
	staffID := uint(0)
	if v, ok := c.Get("staff_id"); ok {
		if id, ok2 := v.(uint); ok2 {
			staffID = id
		}
	}

	// When logging:
	log := entity.KennelManagement{
		KennelID: kennelID,
		DogID:    dogID,
		StaffID:  staffID,
		Action:   "assign", // or "remove"
	}
	_ = configs.DB().Create(&log)
}


func DeleteDogFromKennel(c *gin.Context) {
	kid64, _ := strconv.ParseUint(c.Param("kennel_id"), 10, 64)
	kennelID := uint(kid64)

	var dogID uint
	if qs := c.Query("dog_id"); qs != "" {
		if v, err := strconv.ParseUint(qs, 10, 64); err == nil {
			dogID = uint(v)
		}
	}
	if dogID == 0 {
		var body struct {
			DogID uint `json:"dog_id" form:"dog_id"`
		}
		_ = c.ShouldBind(&body)
		if body.DogID == 0 {
			_ = c.ShouldBindJSON(&body)
		}
		dogID = body.DogID
	}
	if dogID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "dog_id is required"})
		return
	}

	res := configs.DB().Model(&entity.Dog{}).
		Where("id = ? AND kennel_id = ?", dogID, kennelID).
		Update("kennel_id", 0)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "remove failed: " + res.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": res.RowsAffected, "dog_id": dogID, "kennel_id": kennelID})
	staffID := uint(0)
	if v, ok := c.Get("staff_id"); ok {
		if id, ok2 := v.(uint); ok2 {
			staffID = id
		}
	}

	// When logging:
	log := entity.KennelManagement{
		KennelID: kennelID,
		DogID:    dogID,
		StaffID:  staffID,
		Action:   "unassign",
	}
	_ = configs.DB().Create(&log)
}

func preloadDog(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Breed").
		Preload("Kennel").
		Preload("AnimalSex").
		Preload("AnimalSize").
		Preload("DogPersonalities").
		Preload("DogPersonalities.Personality")
}

// GET /kennel/:kennel_id/dog
func GetDogInKennel(c *gin.Context) {
	kidStr := c.Param("kennel_id")
	kid64, err := strconv.ParseUint(kidStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid kennel_id"})
		return
	}
	kennelID := uint(kid64)

	var dogs []entity.Dog
	if err := preloadDog(configs.DB()).
		Where("kennel_id = ?", kennelID).
		Order("id DESC").
		Find(&dogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": dogs})
}

func GetAll(c *gin.Context) {
	var zones []entity.Zone
	if err := configs.DB().Order("id ASC").Find(&zones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "zones query failed: " + err.Error()})
		return
	}

	var kennels []entity.Kennel
	// include Zone so the frontend can match kennel.zone.id or kennel.zone.name
	if err := configs.DB().Preload("Zone").Order("id ASC").Find(&kennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "kennels query failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"zones":   zones,
		"kennels": kennels,
	})
}

type CreateZCManagementLogRequest struct {
    KennelID uint   `json:"kennel_id" binding:"required"`
    DogID    uint   `json:"dog_id" binding:"required"`
    StaffID  uint   `json:"staff_id" binding:"required"`
    Action   string `json:"action" binding:"required"` // "assign" or "remove"
}

func CreateZCManagementLog(c *gin.Context) {
    var req struct {
        KennelID uint   `json:"kennel_id" binding:"required"`
        DogID    uint   `json:"dog_id" binding:"required"`
        Action   string `json:"action" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    staffID := uint(0)
    if v, ok := c.Get("staff_id"); ok {
        if id, ok2 := v.(uint); ok2 {
            staffID = id
        }
    }
    if staffID == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "staff_id not found in context"})
        return
    }

    log := entity.KennelManagement{
        KennelID: req.KennelID,
        DogID:    req.DogID,
        StaffID:  staffID,
        Action:   req.Action,
    }
    if err := configs.DB().Create(&log).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "log created", "data": log})
}
