package health_records

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"example.com/project-sa/config"
	"example.com/project-sa/entity"
)

// GetHealthRecordsByDogId retrieves health records for a specific dog
func GetHealthRecordsByDogId(c *gin.Context) {
	dogID := c.Param("id")
	var healthRecords []entity.MedicalRecord

	if err := config.DB().Where("dog_id = ?", dogID).Find(&healthRecords).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "health records not found for this dog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": healthRecords})
}

// CreateHealthRecord creates a new health record
func CreateHealthRecord(c *gin.Context) {
	var healthRecord entity.MedicalRecord

	// Bind the incoming JSON to the healthRecord struct
	if err := c.ShouldBindJSON(&healthRecord); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the record date if not provided (or ensure it's a valid time)
	if healthRecord.DateRecord.IsZero() {
		healthRecord.DateRecord = time.Now()
	}

	// Save the health record to the database
	if err := config.DB().Create(&healthRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": healthRecord})
}

// DeleteHealthRecord deletes a health record by ID
func DeleteHealthRecord(c *gin.Context) {
	id := c.Param("id")

	// Find the health record
	var healthRecord entity.MedicalRecord
	if err := config.DB().First(&healthRecord, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "health record not found"})
		return
	}

	// Delete the health record
	if err := config.DB().Delete(&healthRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Health record deleted successfully"})
}

// UpdateHealthRecord updates an existing health record
func UpdateHealthRecord(c *gin.Context) {
	id := c.Param("id")
	var updatedRecord entity.MedicalRecord

	// Bind the incoming JSON to the updatedRecord struct
	if err := c.ShouldBindJSON(&updatedRecord); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find the existing health record
	var existingRecord entity.MedicalRecord
	if err := config.DB().First(&existingRecord, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "health record not found"})
		return
	}

	// Update fields (excluding primary key and DogID which should not change)
	existingRecord.DateRecord = updatedRecord.DateRecord
	existingRecord.Weight = updatedRecord.Weight
	existingRecord.Temperature = updatedRecord.Temperature
	existingRecord.Symptoms = updatedRecord.Symptoms
	existingRecord.Diagnosis = updatedRecord.Diagnosis
	existingRecord.TreatmentPlan = updatedRecord.TreatmentPlan
	existingRecord.Medication = updatedRecord.Medication
	existingRecord.Vaccination = updatedRecord.Vaccination
	existingRecord.Notes = updatedRecord.Notes

	// Save the updated health record to the database
	if err := config.DB().Save(&existingRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Health record updated successfully", "data": existingRecord})
}
