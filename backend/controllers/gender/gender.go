package genders

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

func GetAll(c *gin.Context) {
	db := configs.DB()
	var gender []entity.Gender
	db.Find(&gender)
	c.JSON(http.StatusOK, &gender)
}
