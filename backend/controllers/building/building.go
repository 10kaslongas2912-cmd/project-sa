package building

import (
    "net/http"
    "example.com/project-sa/entity"
    "example.com/project-sa/configs"
    "github.com/gin-gonic/gin"
)

func GetAllBuildings(c *gin.Context) {
    var buildings []entity.Building
    if err := configs.DB().Find(&buildings).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch buildings"})
        return
    }
    c.JSON(http.StatusOK, buildings)
}
