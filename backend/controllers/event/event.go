package event

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ========== DTOs ========== */

type EventCreateRequest struct {
	Name            string `json:"name" binding:"required"`
	Description     string `json:"description"`
	StartAt         string `json:"start_at" binding:"required"` // "YYYY-MM-DDTHH:MM:SS"
	EndAt           string `json:"end_at" binding:"required"`   // "YYYY-MM-DDTHH:MM:SS"
	Location        string `json:"location"`
	Organizer       string `json:"organizer"`
	ContactInfo     string `json:"contact_info"`
	Capacity        *int   `json:"capacity"`
	ImageURL        string `json:"image_url"`
	VisitID         *uint  `json:"visit_id"`
	MedicalRecordID *uint  `json:"medical_record_id"`
}

type EventUpdateRequest struct {
	Name            *string `json:"name,omitempty"`
	Description     *string `json:"description,omitempty"`
	StartAt         *string `json:"start_at,omitempty"`   // "YYYY-MM-DDTHH:MM:SS"
	EndAt           *string `json:"end_at,omitempty"`     // "YYYY-MM-DDTHH:MM:SS"
	Location        *string `json:"location,omitempty"`
	Organizer       *string `json:"organizer,omitempty"`
	ContactInfo     *string `json:"contact_info,omitempty"`
	Capacity        *int    `json:"capacity,omitempty"`
	ImageURL        *string `json:"image_url,omitempty"`
	VisitID         *uint   `json:"visit_id,omitempty"`
	MedicalRecordID *uint   `json:"medical_record_id,omitempty"`
}

// Response structure with related data
type EventWithRelatedData struct {
	entity.Event
	RelatedVisits        []entity.Visit        `json:"related_visits"`
	RelatedMedicalRecords []entity.MedicalRecord `json:"related_medical_records"`
}

/* ========== Helpers ========== */

func parseDateTime(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	// รับรูปแบบ YYYY-MM-DDTHH:MM:SS หรือ ISO 8601
	layouts := []string{
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05.000Z",
	}
	
	for _, layout := range layouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		}
	}
	
	return time.Time{}, errors.New("invalid datetime format")
}

func preloadEvent(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Visit").
		Preload("MedicalRecord").
		Preload("MedicalRecord.Dog")
}

/* ========== Image Upload Handler ========== */

// UploadEventImage handles image upload for events
func UploadEventImage(c *gin.Context) {
	// ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 10<<20) // 10MB
	
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get image file: " + err.Error()})
		return
	}
	defer file.Close()

	// ตรวจสอบชนิดไฟล์
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"})
		return
	}

	// สร้างชื่อไฟล์ใหม่
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		// ถ้าไม่มี extension ให้เดาจาก Content-Type
		switch contentType {
		case "image/jpeg", "image/jpg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		case "image/webp":
			ext = ".webp"
		}
	}

	filename := fmt.Sprintf("event_%d%s", time.Now().Unix(), ext)
	
	// สร้าง directory ถ้ายังไม่มี
	uploadDir := "./static/uploads/events"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory: " + err.Error()})
		return
	}

	// บันทึกไฟล์
	filepath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file: " + err.Error()})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	// สร้าง URL สำหรับเข้าถึงไฟล์
	imageURL := fmt.Sprintf("/static/uploads/events/%s", filename)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Image uploaded successfully",
		"image_url": imageURL,
		"filename":  filename,
	})
}

/* ========== CRUD Handlers ========== */

// CreateEvent (C)
func CreateEvent(c *gin.Context) {
	var req EventCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	startAt, err := parseDateTime(req.StartAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_at format: " + err.Error()})
		return
	}

	endAt, err := parseDateTime(req.EndAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_at format: " + err.Error()})
		return
	}

	event := entity.Event{
		Name:            req.Name,
		Description:     &req.Description,
		StartAt:         startAt,
		EndAt:           endAt,
		Location:        &req.Location,
		Organizer:       &req.Organizer,
		ContactInfo:     &req.ContactInfo,
		Capacity:        req.Capacity,
		ImageURL:        &req.ImageURL,
		VisitID:         req.VisitID,
		MedicalRecordID: req.MedicalRecordID,
	}

	if err := configs.DB().Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed: " + err.Error()})
		return
	}

	var res entity.Event
	if err := preloadEvent(configs.DB()).First(&res, event.ID).Error; err != nil {
		c.JSON(http.StatusCreated, gin.H{"data": event})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": res})
}

// GetEventById (R - by ID)
func GetEventById(c *gin.Context) {
	id := c.Param("id")
	var event entity.Event
	if err := preloadEvent(configs.DB()).First(&event, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": event})
}

// GetAllEvents (R - all) + filter + pagination
func GetAllEvents(c *gin.Context) {
	db := configs.DB()

	// Add optional filters
	if name := c.Query("name"); name != "" {
		db = db.Where("name LIKE ?", "%"+name+"%")
	}
	if organizer := c.Query("organizer"); organizer != "" {
		db = db.Where("organizer LIKE ?", "%"+organizer+"%")
	}

	// Pagination
	page := 1
	limit := 10
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := (page - 1) * limit

	var events []entity.Event
	var total int64

	// Get total count
	if err := db.Model(&entity.Event{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count failed: " + err.Error()})
		return
	}

	// Get paginated events
	if err := preloadEvent(db).Order("created_at DESC").Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	totalPages := (int(total) + limit - 1) / limit

	response := gin.H{
		"data": events,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_items":  total,
			"items_per_page": limit,
		},
	}

	c.JSON(http.StatusOK, response)
}

// GetEventsWithRelatedData - Get events with related visits and medical records
func GetEventsWithRelatedData(c *gin.Context) {
	var events []entity.Event
	if err := preloadEvent(configs.DB()).Order("start_at DESC").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	// Get all visits and medical records for display
	var visits []entity.Visit
	var medicalRecords []entity.MedicalRecord

	if err := configs.DB().Order("start_at DESC").Find(&visits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch visits: " + err.Error()})
		return
	}

	if err := configs.DB().Preload("Dog").Order("date_record DESC").Find(&medicalRecords).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch medical records: " + err.Error()})
		return
	}

	response := gin.H{
		"events":          events,
		"visits":          visits,
		"medical_records": medicalRecords,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateEvent (U) — partial update
func UpdateEvent(c *gin.Context) {
	id := c.Param("id")

	var existing entity.Event
	if err := configs.DB().First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	var req EventUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.Organizer != nil {
		updates["organizer"] = *req.Organizer
	}
	if req.ContactInfo != nil {
		updates["contact_info"] = *req.ContactInfo
	}
	if req.Capacity != nil {
		updates["capacity"] = *req.Capacity
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.VisitID != nil {
		updates["visit_id"] = *req.VisitID
	}
	if req.MedicalRecordID != nil {
		updates["medical_record_id"] = *req.MedicalRecordID
	}
	if req.StartAt != nil {
		if t, err := parseDateTime(*req.StartAt); err == nil {
			updates["start_at"] = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_at format"})
			return
		}
	}
	if req.EndAt != nil {
		if t, err := parseDateTime(*req.EndAt); err == nil {
			updates["end_at"] = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_at format"})
			return
		}
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	if err := configs.DB().Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
		return
	}

	var out entity.Event
	if err := preloadEvent(configs.DB()).First(&out, id).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": existing})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

// DeleteEvent (D)
func DeleteEvent(c *gin.Context) {
	id := c.Param("id")

	var event entity.Event
	if err := configs.DB().First(&event, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed: " + err.Error()})
		return
	}

	if err := configs.DB().Delete(&event).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete event: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": event.ID})
}