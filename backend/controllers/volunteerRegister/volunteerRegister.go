package volunteers

import (
	"net/http"
	"time"
	"strings"
	"fmt"
	"gorm.io/gorm"
	// NOTE: be consistent: if your package is "config", use that everywhere.
	// Below I use "configs" because your file imports show that.
	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

/* ---------------------------- DTOs (request) ---------------------------- */

type CreateVolunteerDTO struct {
	UserID         uint    `json:"user_id" binding:"required"`
	Role           string  `json:"role"`
	Address        string  `json:"address"`
	AnotherContact string  `json:"another_contact"`
	HealthDetail   string  `json:"health_detail"`
	WorkingDate    string  `json:"working_date" binding:"required"` // "YYYY-MM-DD"
	WorkingTime    string  `json:"working_time"`
	Skill          *string `json:"skill"`
	Note           string  `json:"note"`
	StatusFVID     uint    `json:"status_fv_id"` // optional from client
}

type UpdateVolunteerDTO struct {
	UserID         *uint   `json:"user_id"`
	Role           *string `json:"role"`
	Address        *string `json:"address"`
	AnotherContact *string `json:"another_contact"`
	HealthDetail   *string `json:"health_detail"`
	WorkingDate    *string `json:"working_date"` // "YYYY-MM-DD"
	WorkingTime    *string `json:"working_time"`
	Skill          *string `json:"skill"`
	Note           *string `json:"note"`
	StatusFVID     *uint   `json:"status_fv_id"`
}

/* ------------------------------ Helpers -------------------------------- */

func parseYMD(s string) (time.Time, error) {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return time.Time{}, err
	}
	return t, nil
}

/* ------------------------------- Handlers ------------------------------- */

// GET /volunteers
func GetAllVolunteers(c *gin.Context) {
	var volunteers []entity.Volunteer
	if err := configs.DB().Preload("User").Preload("StatusFV").Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// GET /volunteer/:id
func GetVolunteerByID(c *gin.Context) {
	id := c.Param("id")
	var v entity.Volunteer
	if err := configs.DB().Preload("User").Preload("StatusFV").First(&v, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": v})
}

// GET /volunteers/user/:user_id
func GetVolunteersByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	var volunteers []entity.Volunteer
	if err := configs.DB().Preload("User").Preload("StatusFV").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteers not found for this user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// GET /volunteers/skill/:skill_id
func GetVolunteersBySkillID(c *gin.Context) {
	id := c.Param("skill_id")

	var skill entity.Skill
	if err := configs.DB().First(&skill, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "skill not found"})
		return
	}

	var volunteers []entity.Volunteer
	like := "%" + skill.Description + "%"
	if err := configs.DB().Preload("User").Preload("StatusFV").
		Where("skill LIKE ?", like).
		Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// POST /volunteer
func CreateVolunteer(c *gin.Context) {
	var in CreateVolunteerDTO
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wd, err := parseYMD(in.WorkingDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid working_date; expected YYYY-MM-DD"})
		return
	}

	// Default to "pending" if no status provided
	if in.StatusFVID == 0 {
		var pending entity.StatusFV
		if err := configs.DB().First(&pending, "status = ?", "pending").Error; err == nil {
			in.StatusFVID = pending.ID
		}
	}

	v := entity.Volunteer{
		UserID:         in.UserID,
		Role:           in.Role,
		Address:        in.Address,
		AnotherContact: in.AnotherContact,
		HealthDetail:   in.HealthDetail,
		WorkingDate:    wd,
		WorkingTime:    in.WorkingTime,
		Skill:          in.Skill,
		Note:           in.Note,
		StatusFVID:     in.StatusFVID,
	}

	if err := configs.DB().Create(&v).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	configs.DB().Preload("User").Preload("StatusFV").First(&v, v.ID)
	c.JSON(http.StatusCreated, gin.H{"data": v})
}

// PUT /volunteer/:id
func UpdateVolunteer(c *gin.Context) {
	id := c.Param("id")

	var in UpdateVolunteerDTO
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var v entity.Volunteer
	if err := configs.DB().First(&v, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}

	// patch
	if in.UserID != nil {
		v.UserID = *in.UserID
	}
	if in.Role != nil {
		v.Role = *in.Role
	}
	if in.Address != nil {
		v.Address = *in.Address
	}
	if in.AnotherContact != nil {
		v.AnotherContact = *in.AnotherContact
	}
	if in.HealthDetail != nil {
		v.HealthDetail = *in.HealthDetail
	}
	if in.WorkingDate != nil && *in.WorkingDate != "" {
		wd, err := parseYMD(*in.WorkingDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid working_date; expected YYYY-MM-DD"})
			return
		}
		v.WorkingDate = wd
	}
	if in.WorkingTime != nil {
		v.WorkingTime = *in.WorkingTime
	}
	if in.Skill != nil {
		v.Skill = in.Skill
	}
	if in.Note != nil {
		v.Note = *in.Note
	}
	if in.StatusFVID != nil {
		v.StatusFVID = *in.StatusFVID
	}

	if err := configs.DB().Save(&v).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	configs.DB().Preload("User").Preload("StatusFV").First(&v, v.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Volunteer updated successfully", "data": v})
}

// DELETE /volunteer/:id
func DeleteVolunteer(c *gin.Context) {
	id := c.Param("id")

	var v entity.Volunteer
	if err := configs.DB().First(&v, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}
	if err := configs.DB().Delete(&v).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Volunteer deleted successfully"})
}

// GET /volunteers/by-date?date=YYYY-MM-DD
func GetVolunteersByWorkingDate(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date parameter is required (YYYY-MM-DD)"})
		return
	}
	d, err := parseYMD(dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, expected YYYY-MM-DD"})
		return
	}

	start := time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, d.Location())
	end := start.Add(24 * time.Hour)

	var volunteers []entity.Volunteer
	if err := configs.DB().Preload("User").Preload("StatusFV").
		Where("working_date >= ? AND working_date < ?", start, end).
		Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": volunteers})
}

// GET /skills
func GetAllSkills(c *gin.Context) {
	db := configs.DB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB is not initialized"})
		return
	}
	var skills []entity.Skill
	if err := db.Find(&skills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": skills})
}

// PUT /volunteer/:id/status   body: { "status": "approved" | "rejected" 
var allowedStatuses = map[string]struct{}{
	"pending":  {},
	"approved": {},
	"rejected": {},
}

func normalizeStatus(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

// ensureStatus finds (case-insensitive) or creates a StatusFV row.
func ensureStatus(db *gorm.DB, s string) (entity.StatusFV, error) {
	ns := normalizeStatus(s)
	if _, ok := allowedStatuses[ns]; !ok {
		return entity.StatusFV{}, fmt.Errorf("invalid status %q (allowed: pending, approved, rejected)", s)
	}

	var st entity.StatusFV
	// Case-insensitive match using LOWER(...) = LOWER(?) – works on Postgres/MySQL/SQLite
	if err := db.Where("LOWER(status) = LOWER(?)", ns).First(&st).Error; err == nil {
		return st, nil
	}

	// Not found -> create it
	st = entity.StatusFV{Status: ns}
	if err := db.Create(&st).Error; err != nil {
		return entity.StatusFV{}, err
	}
	return st, nil
}
type updateStatusReq struct {
	Status string `json:"status"`
}

func UpdateVolunteerStatus(c *gin.Context) {
	id := c.Param("id")

	var req updateStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := configs.DB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB is not initialized"})
		return
	}

	// Find or create the status row (case-insensitive), validate allowed values.
	st, err := ensureStatus(db, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure the volunteer exists (and load current status to return)
	var v entity.Volunteer
	if err := db.First(&v, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "volunteer not found"})
		return
	}

	if err := db.Model(&entity.Volunteer{}).Where("id = ?", id).
		Update("status_fv_id", st.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "status updated",
		"status":  st.Status,
	})
}

func GetAllStatusFV(c *gin.Context) {
	var statusFVs []entity.StatusFV
	if err := configs.DB().Find(&statusFVs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": statusFVs})
}

