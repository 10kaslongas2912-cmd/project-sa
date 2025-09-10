package manages

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"example.com/project-sa/entity"
	"example.com/project-sa/configs"
)

// ------------------ CREATE ------------------
type CreateManageRequest struct {
	DateTask   string `json:"date_task" binding:"required"`
	TypeTask   string `json:"type_task" binding:"required"`
	DetailTask string `json:"detail_task"`
	StaffID    uint   `json:"staff_id" binding:"required,gt=0"`
	BuildingID uint   `json:"building_id" binding:"required,gt=0"`
}

func CreateManage(c *gin.Context) {
	var req CreateManageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dateTask, err := time.Parse("2006-01-02", req.DateTask)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_task format, use YYYY-MM-DD"})
		return
	}

	manage := entity.Manage{
		DateTask:   dateTask,
		TypeTask:   req.TypeTask,
		DetailTask: req.DetailTask,
		StaffID:    req.StaffID,
		BuildingID: req.BuildingID,
	}

	if err := configs.DB().Create(&manage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create manage"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "manage created successfully", "data": manage})
}

// ------------------ READ (Get all) ------------------
func GetAllManages(c *gin.Context) {
	var manages []entity.Manage
	if err := configs.DB().Preload("Staff").Preload("Building").Find(&manages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch manages"})
		return
	}
	c.JSON(http.StatusOK, manages)
}

// ------------------ READ (Get by ID) ------------------
func GetManageByID(c *gin.Context) {
	id := c.Param("id")
	var manage entity.Manage
	if err := configs.DB().Preload("Staff").Preload("Building").First(&manage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "manage not found"})
		return
	}
	c.JSON(http.StatusOK, manage)
}

// ------------------ UPDATE ------------------
func UpdateManage(c *gin.Context) {
	id := c.Param("id")
	var manage entity.Manage
	if err := configs.DB().First(&manage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "manage not found"})
		return
	}

	var req CreateManageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dateTask, err := time.Parse("2006-01-02", req.DateTask)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_task format, use YYYY-MM-DD"})
		return
	}

	manage.DateTask = dateTask
	manage.TypeTask = req.TypeTask
	manage.DetailTask = req.DetailTask
	manage.StaffID = req.StaffID
	manage.BuildingID = req.BuildingID

	if err := configs.DB().Save(&manage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update manage"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "manage updated successfully", "data": manage})
}

// ------------------ DELETE ------------------
func DeleteManage(c *gin.Context) {
	id := c.Param("id")
	if err := configs.DB().Delete(&entity.Manage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete manage"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "manage deleted successfully"})
}
