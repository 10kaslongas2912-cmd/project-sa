package httpparse

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func QueryUint(c *gin.Context, key string) (*uint, error) {
	v := strings.TrimSpace(c.Query(key))
	if v == "" { return nil, nil }
	u64, err := strconv.ParseUint(v, 10, 64)
	if err != nil { return nil, fmt.Errorf("invalid %s", key) }
	u := uint(u64)
	return &u, nil
}

func ParamUint(c *gin.Context, key string) (uint, error) {
	v := c.Param(key)
	u64, err := strconv.ParseUint(v, 10, 64)
	if err != nil { return 0, fmt.Errorf("invalid %s", key) }
	return uint(u64), nil
}
