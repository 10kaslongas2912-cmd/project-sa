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
}

// DELETE /kennel/:kennel_id/dog   (?dog_id=) or { dog_id }
// Option B: write 0 instead of NULL to "unassign" the kennel.
// NOTE: Ensure you do NOT have a strict DB-level FK on dogs.kennel_id,
// otherwise writing 0 will fail. (GORM doesn't add strict FKs by default.)
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

	// Keep the guard so we only unassign if the dog is in this kennel.
	// If you want to allow “unassign regardless of current kennel”,
	// change WHERE to only "id = ?".
	res := configs.DB().Model(&entity.Dog{}).
		Where("id = ? AND kennel_id = ?", dogID, kennelID).
		Update("kennel_id", 0)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "remove failed: " + res.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": res.RowsAffected, "dog_id": dogID, "kennel_id": kennelID})
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
