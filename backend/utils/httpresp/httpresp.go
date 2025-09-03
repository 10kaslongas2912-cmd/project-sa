package httpresp

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
type APIResponse struct {
	Data  any       `json:"data,omitempty"`
	Meta  any       `json:"meta,omitempty"`
	Error *APIError `json:"error,omitempty"`
}

func OK(c *gin.Context, data any, meta any) {
	c.JSON(http.StatusOK, APIResponse{Data: data, Meta: meta})
}
func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, APIResponse{Data: data})
}
func Fail(c *gin.Context, status int, code, msg string) {
	c.JSON(status, APIResponse{Error: &APIError{Code: code, Message: msg}})
}
