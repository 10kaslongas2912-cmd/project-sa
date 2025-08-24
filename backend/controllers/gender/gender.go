package genders

import (
	"net/http"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

func GetAll(c *gin.Context) {
	db := config.DB()
	var gender []entity.Gender
	db.Find(&gender)
	c.JSON(http.StatusOK, &gender)
}
