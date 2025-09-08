package zcmanagement

import (
	"net/http"
	"strconv"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// Get all zones
func GetZones(c *gin.Context) {
	var zones []entity.Zone
	if err := configs.DB().Find(&zones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch zones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": zones})
}

// Get kennels by zone
func GetKennelsByZone(c *gin.Context) {
	zoneID := c.Param("zone_id")
	var kennels []entity.Kennel
	if err := configs.DB().Where("zone_id = ?", zoneID).Find(&kennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennels"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": kennels})
}

// Get dog in kennel (by kennel id)
func GetDogInKennel(c *gin.Context) {
	kennelID := c.Param("kennel_id")
	var km entity.KennelManagement
	if err := configs.DB().
		Preload("Kennel").
		Preload("Staff").
		Preload("Dog").
		Where("kennel_id = ?", kennelID).
		First(&km).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no dog assigned to this kennel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": km})
}

// Assign or update dog in kennel
func UpdateDogInKennel(c *gin.Context) {
	kennelID := c.Param("kennel_id")
	var req struct {
		DogID   uint `json:"dog_id"`
		StaffID uint `json:"staff_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var km entity.KennelManagement
	if err := configs.DB().Where("kennel_id = ?", kennelID).First(&km).Error; err != nil {
		// If not found, create new assignment
		kennelIDUint, _ := strconv.ParseUint(kennelID, 10, 64)
		km = entity.KennelManagement{
			KennelID: uint(kennelIDUint),
			DogID:    req.DogID,
			StaffID:  req.StaffID,
		}
		if err := configs.DB().Create(&km).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign dog"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"data": km})
		return
	}
	// Update existing assignment
	km.DogID = req.DogID
	km.StaffID = req.StaffID
	if err := configs.DB().Save(&km).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update dog assignment"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": km})
}

// Remove dog from kennel (delete assignment)
func DeleteDogFromKennel(c *gin.Context) {
	kennelID := c.Param("kennel_id")
	if err := configs.DB().Where("kennel_id = ?", kennelID).Delete(&entity.KennelManagement{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove dog from kennel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "dog removed from kennel"})
}

func GetAll(c *gin.Context) {
	var zones []entity.Zone
	var kennels []entity.Kennel
	var kennelManagements []entity.KennelManagement

	// Fetch all zones
	if err := configs.DB().Find(&zones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch zones"})
		return
	}

	// Fetch all kennels
	if err := configs.DB().Preload("Zone").Find(&kennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennels"})
		return
	}

	// Fetch all kennel managements (dog assignments)
	if err := configs.DB().
		Preload("Kennel").
		Preload("Dog").
		Preload("Staff").
		Find(&kennelManagements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennel managements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"zones":              zones,
		"kennels":            kennels,
		"kennel_managements": kennelManagements,
	})
}
