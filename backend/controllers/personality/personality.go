package controllers

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GET /personalities
func GetAllPersonalities(c *gin.Context) {
	db := configs.DB()

	var personalities []entity.Personality

	if err := db.Find(&personalities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลบุคลิกได้",
		})
		return
	}

	c.JSON(http.StatusOK, personalities)
}
