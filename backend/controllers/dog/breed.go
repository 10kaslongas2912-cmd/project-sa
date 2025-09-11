package dog

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GET /animal-sizes
func GetAllBreeds(c *gin.Context) {
	db := configs.DB()

	var breeds []entity.Breed
	if err := db.Order("id ASC").Find(&breeds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงรายการขนาดได้"})
		return
	}

	c.JSON(http.StatusOK, breeds)
}
