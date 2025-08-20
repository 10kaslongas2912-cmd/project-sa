package payment_methods

import (
	"net/http"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

func GetAll(c *gin.Context) {
	var paymentMethods []entity.PaymentMethods
	db := config.DB()

	if err := db.Find(&paymentMethods).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, paymentMethods)
}