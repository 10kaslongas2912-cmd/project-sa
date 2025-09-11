package dog

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadDogImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported file type"})
		return
	}
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (>5MB)"})
		return
	}

	// โฟลเดอร์รายเดือน เช่น static/upload/dog/2025/09
	ym := time.Now().Format("2006/01")
	dir := filepath.Join("static", "uploads", "dog", ym)
	if err := os.MkdirAll(dir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create upload dir"})
		return
	}

	// ตั้งชื่อไฟล์แบบ UUID กันชนกัน
	fname := fmt.Sprintf("dog-%s%s", uuid.NewString(), ext)
	dst := filepath.Join(dir, fname)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save failed"})
		return
	}

	url := "/static/upload/dog/" + ym + "/" + fname
	c.JSON(http.StatusOK, gin.H{"url": url, "filename": fname})
}
