package volunteers

import (
	"net/http"
	"time"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GetAllVolunteers retrieves all volunteers
func GetAllVolunteers(c *gin.Context) {
	var volunteers []entity.Volunteer

	if err := config.DB().Preload("Users").Preload("Skills").Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// GetVolunteerByID retrieves a volunteer by ID
func GetVolunteerByID(c *gin.Context) {
	id := c.Param("id")
	var volunteer entity.Volunteer

	if err := config.DB().Preload("Users").Preload("Skills").First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteer})
}

// GetVolunteersByUserID retrieves volunteers for a specific user
func GetVolunteersByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	var volunteers []entity.Volunteer

	if err := config.DB().Preload("Users").Preload("Skills").Where("user_id = ?", userID).Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteers not found for this user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// GetVolunteersBySkillID retrieves volunteers with a specific skill
func GetVolunteersBySkillID(c *gin.Context) {
	skillID := c.Param("skill_id")
	var volunteers []entity.Volunteer

	if err := config.DB().Preload("Users").Preload("Skills").Where("skill_id = ?", skillID).Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteers not found for this skill"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// CreateVolunteer creates a new volunteer record
func CreateVolunteer(c *gin.Context) {
	var volunteer entity.Volunteer

	// Bind the incoming JSON to the volunteer struct
	if err := c.ShouldBindJSON(&volunteer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the working date if not provided (or ensure it's a valid time)
	if volunteer.WorkingDate.IsZero() {
		volunteer.WorkingDate = time.Now()
	}

	// Save the volunteer to the database
	if err := config.DB().Create(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load associations for response
	config.DB().Preload("Users").Preload("Skills").First(&volunteer, volunteer.ID)

	c.JSON(http.StatusCreated, gin.H{"data": volunteer})
}

// UpdateVolunteer updates an existing volunteer record
func UpdateVolunteer(c *gin.Context) {
	id := c.Param("id")
	var updatedVolunteer entity.Volunteer

	// Bind the incoming JSON to the updatedVolunteer struct
	if err := c.ShouldBindJSON(&updatedVolunteer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find the existing volunteer
	var existingVolunteer entity.Volunteer
	if err := config.DB().First(&existingVolunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}

	// Update fields (excluding primary key)
	existingVolunteer.Address = updatedVolunteer.Address
	existingVolunteer.PhoneNumber = updatedVolunteer.PhoneNumber
	existingVolunteer.AnotherContact = updatedVolunteer.AnotherContact
	existingVolunteer.HealthDetail = updatedVolunteer.HealthDetail
	existingVolunteer.WorkingDate = updatedVolunteer.WorkingDate
	existingVolunteer.WorkingTime = updatedVolunteer.WorkingTime
	existingVolunteer.Skill = updatedVolunteer.Skill
	existingVolunteer.Note = updatedVolunteer.Note
	existingVolunteer.PhotoAdr = updatedVolunteer.PhotoAdr
	existingVolunteer.UserID = updatedVolunteer.UserID

	// Save the updated volunteer to the database
	if err := config.DB().Save(&existingVolunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load associations for response
	config.DB().Preload("Users").Preload("Skills").First(&existingVolunteer, existingVolunteer.ID)

	c.JSON(http.StatusOK, gin.H{"message": "Volunteer updated successfully", "data": existingVolunteer})
}

// DeleteVolunteer deletes a volunteer by ID
func DeleteVolunteer(c *gin.Context) {
	id := c.Param("id")

	// Find the volunteer
	var volunteer entity.Volunteer
	if err := config.DB().First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}

	// Delete the volunteer
	if err := config.DB().Delete(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Volunteer deleted successfully"})
}

// GetVolunteersByWorkingDate retrieves volunteers by working date
func GetVolunteersByWorkingDate(c *gin.Context) {
	dateStr := c.Query("date") // Expected format: "2006-01-02"
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date parameter is required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, expected YYYY-MM-DD"})
		return
	}

	var volunteers []entity.Volunteer

	// Query for volunteers working on the specific date
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	if err := config.DB().Preload("Users").Preload("Skills").
		Where("working_date >= ? AND working_date < ?", startOfDay, endOfDay).
		Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}
