package dogs

import (
	"github.com/gin-gonic/gin"
	"example.com/project-sa/config"
	"example.com/project-sa/entity"
	"net/http"
)

// SearchDogs handles searching for dogs by name
func SearchDogs(c *gin.Context) {
	var dogs []entity.Dog
	name := c.Query("name") // Get name from query parameter

	if name != "" {
		config.DB().Where("name LIKE ?", "%"+name+"%").Find(&dogs)
	} else {
		config.DB().Find(&dogs) // If no name, return all dogs
	}

	if len(dogs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "dogs not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": dogs})
}
