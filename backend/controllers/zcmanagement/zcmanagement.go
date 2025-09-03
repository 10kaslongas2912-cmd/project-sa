package zcmanagement

import (
	"net/http"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GetAllManagementData retrieves all data from zones, kennels, kennel management, and staff
func GetAllManagementData(c *gin.Context) {
	// TODO: Adjust these entity names to match your actual entity structs
	var zones []entity.Zones                       // CHANGE: Replace with your actual Zone entity name
	var kennels []entity.Kennel                    // CHANGE: Replace with your actual Kennel entity name
	var kennelManagement []entity.KennelManagement // CHANGE: Replace with your actual KennelManagement entity name
	var staff []entity.Staffs                      // CHANGE: Replace with your actual Staff entity name

	// Fetch all zones data
	// TODO: Add Preload() if zones have associations you want to include
	if err := config.DB().Find(&zones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch zones data"})
		return
	}

	// Fetch all kennels data
	// TODO: If kennels belong to zones, you might want to Preload("Zone")
	if err := config.DB().Find(&kennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennels data"})
		return
	}

	// Fetch all kennel management data
	// TODO: Add Preload for related entities like Dogs, Kennels, etc.
	// Example: config.DB().Preload("Dog").Preload("Kennel").Find(&kennelManagement)
	if err := config.DB().Find(&kennelManagement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennel management data"})
		return
	}

	// Fetch all staff data
	// TODO: If staff have roles or departments as associations, add Preload
	if err := config.DB().Find(&staff).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch staff data"})
		return
	}

	// IMPORTANT: Combine all data into a single response
	// TODO: Adjust the response structure based on your frontend needs
	response := gin.H{
		"zones":             zones,
		"kennels":           kennels,
		"kennel_management": kennelManagement,
		"staff":             staff,
		"summary": gin.H{
			"total_zones":              len(zones),
			"total_kennels":            len(kennels),
			"total_management_records": len(kennelManagement),
			"total_staff":              len(staff),
			// TODO: Add more summary statistics if needed
		},
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// GetManagementByZone retrieves management data filtered by zone
func GetManagementByZone(c *gin.Context) {
	zoneID := c.Param("zone_id")

	var zone entity.Zones       // CHANGE: Replace with your actual Zone entity name
	var kennels []entity.Kennel // CHANGE: Replace with your actual Kennel entity name

	// Fetch zone details
	if err := config.DB().First(&zone, zoneID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "zone not found"})
		return
	}

	// Fetch kennels in this zone
	// TODO: Adjust the foreign key field name if different (might be zone_id, ZoneID, etc.)
	if err := config.DB().Where("zone_id = ?", zoneID).Find(&kennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch kennels for this zone"})
		return
	}

	// Get kennel IDs for fetching management data
	var kennelIDs []uint
	for _, kennel := range kennels {
		// TODO: Adjust field name based on your Kennel entity (might be ID, KennelID, etc.)
		kennelIDs = append(kennelIDs, kennel.KennelID) // CHANGE: Replace ID with actual primary key field
	}

	// Fetch kennel management data for these kennels
	var kennelManagement []entity.KennelManagement // CHANGE: Replace with your actual entity name
	if len(kennelIDs) > 0 {
		// TODO: Adjust the foreign key field name (might be kennel_id, KennelID, etc.)
		if err := config.DB().Where("kennel_id IN ?", kennelIDs).Find(&kennelManagement).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch management data"})
			return
		}
	}

	response := gin.H{
		"zone":              zone,
		"kennels":           kennels,
		"kennel_management": kennelManagement,
		"statistics": gin.H{
			"total_kennels":      len(kennels),
			"management_records": len(kennelManagement),
			// TODO: Add zone-specific statistics
		},
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// GetAvailableKennels retrieves all available/empty kennels
func GetAvailableKennels(c *gin.Context) {
	var availableKennels []entity.Kennel // CHANGE: Replace with your actual Kennel entity name

	// TODO: Adjust this query based on how you determine if a kennel is available
	// Option 1: If you have a status field in kennels table
	if err := config.DB().Where("status = ?", "available").Find(&availableKennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch available kennels"})
		return
	}

	// Option 2: If availability is determined by checking kennel_management table
	// You might need a more complex query using NOT IN or LEFT JOIN
	// Example:
	// config.DB().Raw(`
	//     SELECT k.* FROM kennels k
	//     LEFT JOIN kennel_management km ON k.id = km.kennel_id
	//     WHERE km.id IS NULL OR km.check_out_date < NOW()
	// `).Scan(&availableKennels)

	c.JSON(http.StatusOK, gin.H{"data": availableKennels})
}

// GetStaffAssignments retrieves staff with their current assignments
func GetStaffAssignments(c *gin.Context) {
	var staff []entity.Staffs // CHANGE: Replace with your actual Staff entity name

	// TODO: If staff have assignments or zones they manage, add Preload
	// Example: config.DB().Preload("Assignments").Preload("ManagedZones").Find(&staff)
	if err := config.DB().Find(&staff).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch staff data"})
		return
	}

	// TODO: You might want to include additional assignment data
	// For example, which zones or kennels each staff member is responsible for

	c.JSON(http.StatusOK, gin.H{"data": staff})
}

// GetOccupancyStatistics retrieves kennel occupancy statistics
func GetOccupancyStatistics(c *gin.Context) {
	var totalKennels int64
	var occupiedKennels int64

	// Count total kennels
	if err := config.DB().Model(&entity.Kennel{}).Count(&totalKennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count kennels"})
		return
	}

	// Count occupied kennels
	// TODO: Adjust this query based on your business logic
	// This assumes a kennel is occupied if there's an active management record
	if err := config.DB().Model(&entity.KennelManagement{}).
		Where("check_out_date IS NULL OR check_out_date > NOW()").
		Count(&occupiedKennels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count occupied kennels"})
		return
	}

	availableKennels := totalKennels - occupiedKennels
	occupancyRate := float64(0)
	if totalKennels > 0 {
		occupancyRate = float64(occupiedKennels) / float64(totalKennels) * 100
	}

	statistics := gin.H{
		"total_kennels":     totalKennels,
		"occupied_kennels":  occupiedKennels,
		"available_kennels": availableKennels,
		"occupancy_rate":    occupancyRate,
		// TODO: Add more statistics as needed
		// Examples:
		// "average_stay_duration": averageStayDuration,
		// "kennels_by_zone": kennelsByZone,
		// "staff_to_kennel_ratio": staffToKennelRatio,
	}

	c.JSON(http.StatusOK, gin.H{"data": statistics})
}

// CreateKennelAssignment assigns a dog to a kennel
func CreateKennelAssignment(c *gin.Context) {
	var assignment entity.KennelManagement // CHANGE: Replace with your actual entity name

	// Bind the incoming JSON
	if err := c.ShouldBindJSON(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Add validation logic here
	// Check if kennel is available
	// Check if dog is not already assigned
	// Validate dates, etc.

	// Save the assignment
	if err := config.DB().Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// TODO: You might want to update kennel status to "occupied" here
	// Example:
	// config.DB().Model(&entity.Kennel{}).Where("id = ?", assignment.KennelID).Update("status", "occupied")

	c.JSON(http.StatusCreated, gin.H{"data": assignment})
}

// UpdateKennelAssignment updates an existing kennel assignment
func UpdateKennelAssignment(c *gin.Context) {
	id := c.Param("id")
	var updatedAssignment entity.KennelManagement // CHANGE: Replace with your actual entity name

	// Bind the incoming JSON
	if err := c.ShouldBindJSON(&updatedAssignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find existing assignment
	var existingAssignment entity.KennelManagement // CHANGE: Replace with your actual entity name
	if err := config.DB().First(&existingAssignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "assignment not found"})
		return
	}

	// TODO: Update only the fields you want to allow changes to
	// Add your field updates here based on your entity structure
	// Example:
	// existingAssignment.CheckOutDate = updatedAssignment.CheckOutDate
	// existingAssignment.Status = updatedAssignment.Status

	// Save the updated assignment
	if err := config.DB().Save(&existingAssignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment updated successfully", "data": existingAssignment})
}

// DeleteKennelAssignment removes a kennel assignment
func DeleteKennelAssignment(c *gin.Context) {
	id := c.Param("id")

	// Find the assignment
	var assignment entity.KennelManagement // CHANGE: Replace with your actual entity name
	if err := config.DB().First(&assignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "assignment not found"})
		return
	}

	// TODO: You might want to update kennel status to "available" before deleting
	// Example:
	// config.DB().Model(&entity.Kennel{}).Where("id = ?", assignment.KennelID).Update("status", "available")

	// Delete the assignment
	if err := config.DB().Delete(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment deleted successfully"})
}
