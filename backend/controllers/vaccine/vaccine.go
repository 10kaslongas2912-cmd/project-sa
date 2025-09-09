package vaccine

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GET /vaccines
func GetAll(c *gin.Context) {
	var vaccines []entity.Vaccine
	if err := configs.DB().Find(&vaccines).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, vaccines)
}
