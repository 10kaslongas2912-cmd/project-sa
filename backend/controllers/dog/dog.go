package dog

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ========== DTOs ========== */

type DogCreateRequest struct {
	Name           string `json:"name" binding:"required"`
	AnimalSexID    uint   `json:"animal_sex_id" binding:"required"`
	AnimalSizeID   uint   `json:"animal_size_id" binding:"required"`
	BreedID        uint   `json:"breed_id" binding:"required"`
	DateOfBirth    string `json:"date_of_birth"` // "YYYY-MM-DD"
	IsAdopted      bool   `json:"is_adopted"`
	PhotoURL       string `json:"photo_url"`
	PersonalityIDs []uint `json:"personality_ids"`
}

type DogUpdateRequest struct {
	DogID          uint     `json:"dog_id"`
	Name           *string  `json:"name,omitempty"`
	AnimalSexID    *uint    `json:"animal_sex_id,omitempty"`
	AnimalSizeID   *uint    `json:"animal_size_id,omitempty"`
	BreedID        *uint    `json:"breed_id,omitempty"`
	KennelID       *uint    `json:"kennel_id,omitempty"`
	DateOfBirth    *string  `json:"date_of_birth,omitempty"` // "YYYY-MM-DD"
	IsAdopted      *bool    `json:"is_adopted,omitempty"`
	PhotoURL       *string  `json:"photo_url,omitempty"`
	PersonalityIDs *[]uint  `json:"personality_ids,omitempty"`
}

/* ========== Helpers ========== */

func parseYMD(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
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
		Preload("DogPersonalities.Personality").
		Preload("CreatedBy").
		Preload("UpdatedBy").
		Preload("DeletedBy")
}

// ดึง staff_id จาก context (middleware ใส่มาแล้ว)
func getStaffID(c *gin.Context) *uint {
	v, ok := c.Get("staff_id")
	if !ok || v == nil {
		return nil
	}
	switch n := v.(type) {
	case uint:
		if n == 0 {
			return nil
		}
		return &n
	case int:
		if n <= 0 {
			return nil
		}
		u := uint(n)
		return &u
	default:
		return nil
	}
}

/* ========== CRUD Handlers ========== */

// CreateDog (C)
// POST /dogs
func CreateDog(c *gin.Context) {
	var req DogCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	db := configs.DB()
	var created entity.Dog
	staffID := getStaffID(c)

	if err := db.Transaction(func(tx *gorm.DB) error {
		d := entity.Dog{
			Name:         req.Name,
			AnimalSexID:  req.AnimalSexID,
			AnimalSizeID: req.AnimalSizeID,
			BreedID:      req.BreedID,
			DateOfBirth:  req.DateOfBirth,
			IsAdopted:    req.IsAdopted,
			PhotoURL:     req.PhotoURL,
		}
		if err := tx.Create(&d).Error; err != nil {
			return err
		}

		// ติด audit ผู้สร้าง (ถ้ามี staff_id)
		if staffID != nil {
			if err := tx.Model(&entity.Dog{}).
				Where("id = ?", d.ID).
				Updates(map[string]any{
					"created_by_id": *staffID,
					"updated_by_id": *staffID, // สร้าง = อัปเดตครั้งแรกด้วย
				}).Error; err != nil {
				return err
			}
		}

		// personalities
		if len(req.PersonalityIDs) > 0 {
			rows := make([]entity.DogPersonality, 0, len(req.PersonalityIDs))
			seen := map[uint]struct{}{}
			for _, pid := range req.PersonalityIDs {
				if _, ok := seen[pid]; ok {
					continue
				}
				seen[pid] = struct{}{}
				rows = append(rows, entity.DogPersonality{DogID: d.ID, PersonalityID: pid})
			}
			if err := tx.Create(&rows).Error; err != nil {
				return err
			}
		}

		// preload ก่อนส่งออก
		if err := preloadDog(tx).First(&created, d.ID).Error; err != nil {
			created = d
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	c.Header("Location", fmt.Sprintf("/dogs/%d", created.ID))
	c.JSON(http.StatusCreated, created)
}

// GetDogById (R - by ID)
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

// GetAllDogs (R - all) + filter
func GetAllDogs(c *gin.Context) {
	db := configs.DB()
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
	if err := preloadDog(db).Order("id DESC").Find(&dogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, dogs)
}

// UpdateDog (U) — partial
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

	db := configs.DB()
	staffID := getStaffID(c)

	if err := db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]any{}

		if req.Name != nil {
			updates["name"] = *req.Name
		}
		if req.AnimalSexID != nil {
			updates["animal_sex_id"] = *req.AnimalSexID
		}
		if req.AnimalSizeID != nil {
			updates["animal_size_id"] = *req.AnimalSizeID
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
		if req.DateOfBirth != nil {
			if _, err := parseYMD(*req.DateOfBirth); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_of_birth (YYYY-MM-DD)"})
				return nil
			}
			updates["date_of_birth"] = *req.DateOfBirth
		}

		// ติด audit ผู้แก้ไข
		if staffID != nil {
			updates["updated_by_id"] = *staffID
		}

		if len(updates) > 0 {
			if err := tx.Model(&existing).Updates(updates).Error; err != nil {
				return err
			}
		}

		// personalities: replace ทั้งชุดถ้าส่งมา
		if req.PersonalityIDs != nil {
			if err := tx.Unscoped().
				Where("dog_id = ?", existing.ID).
				Delete(&entity.DogPersonality{}).Error; err != nil {
				return err
			}
			if len(*req.PersonalityIDs) > 0 {
				rows := make([]entity.DogPersonality, 0, len(*req.PersonalityIDs))
				seen := map[uint]struct{}{}
				for _, pid := range *req.PersonalityIDs {
					if _, ok := seen[pid]; ok {
						continue
					}
					seen[pid] = struct{}{}
					rows = append(rows, entity.DogPersonality{
						DogID: existing.ID, PersonalityID: pid,
					})
				}
				if err := tx.Create(&rows).Error; err != nil {
					return err
				}
			}
		}

		var out entity.Dog
		if err := preloadDog(tx).First(&out, existing.ID).Error; err != nil {
			c.JSON(http.StatusOK, existing)
			return nil
		}
		c.JSON(http.StatusOK, out)
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
		return
	}
}

// DeleteDog (D)
func DeleteDog(c *gin.Context) {
	id := c.Param("id")

	var dog entity.Dog
	if err := configs.DB().First(&dog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	db := configs.DB()
	staffID := getStaffID(c)

	if err := db.Transaction(func(tx *gorm.DB) error {
		// ติด audit ผู้ลบ (ก่อน soft delete)
		if staffID != nil {
			if err := tx.Model(&dog).
				Update("deleted_by_id", *staffID).Error; err != nil {
				return err
			}
		}
		if err := tx.Delete(&dog).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete dog (maybe referenced by other records): " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
