package health_records

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// Payload struct for creating a health record with associated vaccine records

type CreateHealthRecordPayload struct {
	HealthRecord   *entity.MedicalRecord  `json:"health_record"`
	VaccineRecords []entity.VaccineRecord `json:"vaccine_records"`
}

// GetHealthRecordsByDogId retrieves health records for a specific dog
func GetHealthRecordsByDogId(c *gin.Context) {
	dogID := c.Param("id")
	var healthRecords []entity.MedicalRecord

	if err := configs.DB().Preload("VaccineRecords").Where("dog_id = ?", dogID).Find(&healthRecords).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "health records not found for this dog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": healthRecords})
}

// CreateHealthRecord creates a new health record and optionally its vaccine records
func CreateHealthRecord(c *gin.Context) {
	var payload CreateHealthRecordPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	tx := configs.DB().Begin()

	// Create the main health record
	healthRecord := payload.HealthRecord // healthRecord is a pointer
	if err := tx.Create(healthRecord).Error; err != nil { // Pass the pointer directly
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create health record: " + err.Error()})
		return
	}

	// If vaccine records are provided, create them
	if len(payload.VaccineRecords) > 0 {
		for _, vr := range payload.VaccineRecords {
			vr.MedID = healthRecord.ID // Link to the created health record
			if err := tx.Create(&vr).Error; err != nil { // vr is a value, so we pass its address
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vaccine record: " + err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Health record created successfully", "data": healthRecord})
}

// DeleteHealthRecord deletes a health record by ID
func DeleteHealthRecord(c *gin.Context) {
	id := c.Param("id")

	// Find the health record
	var healthRecord entity.MedicalRecord
	if err := configs.DB().First(&healthRecord, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "health record not found"})
		return
	}

	// Delete the health record
	if err := configs.DB().Delete(&healthRecord).Error; err != nil {
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
	if err := configs.DB().First(&existingRecord, id).Error; err != nil {
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
	if err := configs.DB().Save(&existingRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Health record updated successfully", "data": existingRecord})
}
