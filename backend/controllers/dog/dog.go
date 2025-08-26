package dogs

import (
	"errors"
	"net/http"
	"strconv"
	"time"
	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ========== DTOs ========== */

type DogCreateRequest struct {
	Name         string `json:"name" binding:"required"`
	AnimalSexID  uint   `json:"animal_sex_id" binding:"required"`
	BreedID      uint   `json:"breed_id" binding:"required"`
	KennelID     uint   `json:"kennel_id" binding:"required"`
	DateOfBirth  string `json:"date_of_birth"`  // "YYYY-MM-DD"
	DateArrived  string `json:"date_arrived"`   // "YYYY-MM-DD"
	IsAdopted    bool   `json:"is_adopted"`
	PhotoURL     string `json:"photo_url"`
	Character    string `json:"character"`
}

type DogUpdateRequest struct {
	Name         *string `json:"name,omitempty"`
	AnimalSexID  *uint   `json:"animal_sex_id,omitempty"`
	BreedID      *uint   `json:"breed_id,omitempty"`
	KennelID     *uint   `json:"kennel_id,omitempty"`
	DateOfBirth  *string `json:"date_of_birth,omitempty"` // "YYYY-MM-DD"
	DateArrived  *string `json:"date_arrived,omitempty"`  // "YYYY-MM-DD"
	IsAdopted    *bool   `json:"is_adopted,omitempty"`
	PhotoURL     *string `json:"photo_url,omitempty"`
	Character    *string `json:"character,omitempty"`
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
		Preload("AnimalSex")
}

/* ========== CRUD Handlers ========== */

// CreateDog (C)
func CreateDog(c *gin.Context) {
	var req DogCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	dob, err := parseYMD(req.DateOfBirth)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth (YYYY-MM-DD)"})
		return
	}
	doa, err := parseYMD(req.DateArrived)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_arrived (YYYY-MM-DD)"})
		return
	}

	dog := entity.Dog{
		Name:        req.Name,
		AnimalSexID: req.AnimalSexID,
		BreedID:     req.BreedID,
		KennelID:    req.KennelID,
		DateOfBirth: dob,
		DateArrived: doa,
		IsAdopted:   req.IsAdopted,
		PhotoURL:    req.PhotoURL,
		Character:   req.Character,
	}

	if err := config.DB().Create(&dog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	var out entity.Dog
	if err := preloadDog(config.DB()).First(&out, dog.ID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": dog}) // fallback ถ้า preload ล้มเหลว
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": out})
}

// GetDogByID (R - by ID)
func GetDogByID(c *gin.Context) {
	id := c.Param("id")
	var dog entity.Dog
	if err := preloadDog(config.DB()).First(&dog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": dog})
}

// GetAllDogs (R - all) + filter + pagination (optional)
func GetAllDogs(c *gin.Context) {
	db := preloadDog(config.DB()).Model(&entity.Dog{})

	// optional filters
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

	// pagination (default: page=1, page_size=20)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	size, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count failed: " + err.Error()})
		return
	}

	var dogs []entity.Dog
	if err := db.Limit(size).Offset(offset).Order("id DESC").Find(&dogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       dogs,
		"pagination": gin.H{"page": page, "page_size": size, "total": total},
	})
}

// UpdateDog (U) — partial update
func UpdateDog(c *gin.Context) {
	id := c.Param("id")

	var existing entity.Dog
	if err := config.DB().First(&existing, id).Error; err != nil {
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
	if req.DateArrived != nil {
		if t, err := parseYMD(*req.DateArrived); err == nil {
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

	if err := config.DB().Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
		return
	}

	var out entity.Dog
	if err := preloadDog(config.DB()).First(&out, id).Error; err != nil {
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
	if err := config.DB().First(&dog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	if err := config.DB().Delete(&dog).Error; err != nil {
		// ถ้ามี FK อ้างถึง (เช่น MedicalRecord) แล้วไม่ได้ตั้ง OnDelete:CASCADE จะลบไม่ออก
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete dog (maybe referenced by other records): " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": dog.ID})
}

/* ========== (ออปชัน) Search เดิมของคุณ ========== */

// SearchDogs: ถ้าอยากคงไว้ด้วยก็ใช้ตัวนี้ (หรือให้ GetAllDogs รองรับ name ก็ได้)
func SearchDogs(c *gin.Context) {
	var dogs []entity.Dog
	name := c.Query("name")
	db := preloadDog(config.DB())

	if name != "" {
		db = db.Where("name LIKE ?", "%"+name+"%")
	}
	if err := db.Find(&dogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}
	if len(dogs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "dogs not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": dogs})
}
