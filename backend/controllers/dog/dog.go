package dog

import (
	"errors"
	"net/http"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ========== DTOs ========== */

type DogCreateRequest struct {
	Name          string `json:"name" binding:"required"`
	AnimalSexID   uint   `json:"animal_sex_id" binding:"required"`
	AnimalSizeID  uint   `json:"animal_size_id" binding:"required"`
	BreedID       uint   `json:"breed_id" binding:"required"`
	KennelID      uint   `json:"kennel_id" binding:"required"`
	DateOfBirth   string `json:"date_of_birth"` // "YYYY-MM-DD"
	DateOfArrived string `json:"date_arrived"`  // "YYYY-MM-DD"
	IsAdopted     bool   `json:"is_adopted"`
	PhotoURL      string `json:"photo_url"`
	Character     string `json:"character"`
}

type DogUpdateRequest struct {
	DogID uint	`json:"dog_id"`
	Name          *string `json:"name,omitempty"`
	AnimalSexID   *uint   `json:"animal_sex_id,omitempty"`
	AnimalSizeID  *uint   `json:"animal_size_id,omitempty"`
	BreedID       *uint   `json:"breed_id,omitempty"`
	KennelID      *uint   `json:"kennel_id,omitempty"`
	DateOfBirth   *string `json:"date_of_birth,omitempty"`   // "YYYY-MM-DD"
	DateOfArrived *string `json:"date_of_arrived,omitempty"` // "YYYY-MM-DD"
	IsAdopted     *bool   `json:"is_adopted,omitempty"`
	PhotoURL      *string `json:"photo_url,omitempty"`
	Character     *string `json:"character,omitempty"`
}

/* ========== Helpers ========== */

func parseYMD(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	// รับรูปแบบ YYYY-MM-DD
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return time.Time{}, err
	}
	return t, nil
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

/* ========== CRUD Handlers ========== */

// CreateDog (C)
func CreateDog(c *gin.Context) {
	var req DogCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	dog := entity.Dog{
		Name:          req.Name,
		AnimalSexID:   req.AnimalSexID,
		AnimalSizeID:  req.AnimalSizeID,
		BreedID:       req.BreedID,
		KennelID:      req.KennelID,
		DateOfBirth:   req.DateOfBirth,
		DateOfArrived: req.DateOfArrived,
		IsAdopted:     req.IsAdopted,
		PhotoURL:      req.PhotoURL,
		Character:     req.Character,
	}

	if err := configs.DB().Create(&dog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	var res entity.Dog
	if err := preloadDog(configs.DB()).First(&res, dog.ID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": dog}) // fallback ถ้า preload ล้มเหลว
		return
	}
	c.JSON(http.StatusCreated,res)
}

// GetDogByID (R - by ID)
func GetDogById(c *gin.Context) {
	id := c.Param("id")
	var dog entity.Dog
	if err := preloadDog(configs.DB()).First(&dog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, dog)
}

// GetAllDogs (R - all) + filter (no pagination)
func GetAllDogs(c *gin.Context) {
    // Start with a new DB instance
    db := configs.DB()

    // Add optional filters
    if name := c.Query("name"); name != "" {
        db = db.Where("name LIKE ?", "%"+name+"%")
    }
    if sexID := c.Query("animal_sex_id"); sexID != "" {
        db = db.Where("animal_sex_id = ?", sexID)
    }
    if breedID := c.Query("breed_id"); breedID != "" {
        db = db.Where("breed_id = ?", breedID)
    }
    if kennelID := c.Query("kennel_id"); kennelID != "" {
        db = db.Where("kennel_id = ?", kennelID)
    }

    var dogs []entity.Dog
    
    // Chain the preload and order commands and then execute the Find method
    if err := preloadDog(db).Order("id DESC").Find(&dogs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, dogs)
}

// UpdateDog (U) — partial update
func UpdateDog(c *gin.Context) {
	id := c.Param("id")

	var existing entity.Dog
	if err := configs.DB().First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	var req DogUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.AnimalSexID != nil {
		updates["animal_sex_id"] = *req.AnimalSexID
	}
	if req.BreedID != nil {
		updates["breed_id"] = *req.BreedID
	}
	if req.KennelID != nil {
		updates["kennel_id"] = *req.KennelID
	}
	if req.IsAdopted != nil {
		updates["is_adopted"] = *req.IsAdopted
	}
	if req.PhotoURL != nil {
		updates["photo_url"] = *req.PhotoURL
	}
	if req.Character != nil {
		updates["character"] = *req.Character
	}
	if req.DateOfBirth != nil {
		if t, err := parseYMD(*req.DateOfBirth); err == nil {
			updates["date_of_birth"] = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth (YYYY-MM-DD)"})
			return
		}
	}
	if req.DateOfArrived != nil {
		if t, err := parseYMD(*req.DateOfArrived); err == nil {
			updates["date_arrived"] = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_arrived (YYYY-MM-DD)"})
			return
		}
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	if err := configs.DB().Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
		return
	}

	var out entity.Dog
	if err := preloadDog(configs.DB()).First(&out, id).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": existing})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

// DeleteDog (D)
func DeleteDog(c *gin.Context) {
	id := c.Param("id")

	// ตรวจสอบว่ามีอยู่จริงก่อน (จะได้แยก 404 กับ FK error)
	var dog entity.Dog
	if err := configs.DB().First(&dog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	if err := configs.DB().Delete(&dog).Error; err != nil {
		// ถ้ามี FK อ้างถึง (เช่น MedicalRecord) แล้วไม่ได้ตั้ง OnDelete:CASCADE จะลบไม่ออก
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete dog (maybe referenced by other records): " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": dog.ID})
}