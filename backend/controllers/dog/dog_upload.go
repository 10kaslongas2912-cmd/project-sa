package dog

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// controllers/dog/dog_upload.go
func UploadDogImage(c *gin.Context) {
    f, err := c.FormFile("file")
    if err != nil { c.JSON(400, gin.H{"error":"file is required"}); return }

    ext := strings.ToLower(filepath.Ext(f.Filename))
    allowed := map[string]bool{".jpg":true,".jpeg":true,".png":true,".webp":true,".gif":true}
    if !allowed[ext] { c.JSON(400, gin.H{"error":"unsupported file type"}); return }

    y := time.Now().Format("2006")
    m := time.Now().Format("01")

    // path บนดิสก์ (ใต้โฟลเดอร์ static)
    dir := filepath.Join("static", "uploads", "dog", y, m)
    if err := os.MkdirAll(dir, 0755); err != nil {
        c.JSON(500, gin.H{"error":"mkdir failed"}); return
    }

    fname := fmt.Sprintf("dog-%s%s", uuid.NewString(), ext)
    full := filepath.Join(dir, fname) // e.g. static/upload/dog/2025/09/dog-xxx.jpg

    if err := c.SaveUploadedFile(f, full); err != nil {
        c.JSON(500, gin.H{"error":"save failed"}); return
    }

    // URL สำหรับ FE (ต้องมี / นำหน้า และเริ่มด้วย /static/...)
    url := "/" + filepath.ToSlash(full) // => /static/upload/dog/2025/09/dog-xxx.jpg
    c.JSON(200, gin.H{"url": url})
}

