package dog

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GET /animal-sexes
func GetAllAnimalSexes(c *gin.Context) {
	db := configs.DB()

	var sexes []entity.AnimalSex
	if err := db.Order("id ASC").Find(&sexes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงรายการเพศได้"})
		return
	}

	c.JSON(http.StatusOK, sexes)
}
