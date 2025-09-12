// controllers/sponsorship/delete.go
package sponsorship

import (
	"net/http"
	"strconv"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type deleteSponsorshipResp struct {
	Success          bool `json:"success"`
	ID               uint `json:"id"`
	DeletedByStaffID uint `json:"deleted_by_staff_id"`
}

func DeleteSponsorship(c *gin.Context) {
	sid := getStaffIDFromCtx(c)
	if sid == nil {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	u64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || u64 == 0 {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	id := uint(u64)

	db := configs.DB()
	err = db.Transaction(func(tx *gorm.DB) error {
		var sp entity.Sponsorship
		if err := tx.First(&sp, id).Error; err != nil {
			return err
		}
		if err := tx.Model(&sp).Update("deleted_by_staff_id", *sid).Error; err != nil {
			return err
		}
		return tx.Delete(&sp).Error // soft delete เพราะใช้ gorm.Model
	})
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, deleteSponsorshipResp{
		Success:          true,
		ID:               id,
		DeletedByStaffID: *sid,
	})
}
