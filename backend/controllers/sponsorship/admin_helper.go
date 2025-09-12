package sponsorship

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func getStaffIDFromCtx(c *gin.Context) *uint {
	if v, ok := c.Get("staff_id"); ok {
		if id, ok2 := v.(uint); ok2 && id > 0 {
			return &id
		}
	}
	return nil
}

func isStaffFromCtx(c *gin.Context) bool {
	if k, ok := c.Get("kind"); ok {
		if s, ok2 := k.(string); ok2 && strings.EqualFold(strings.TrimSpace(s), "staff") {
			return true
		}
	}
	return getStaffIDFromCtx(c) != nil
}
