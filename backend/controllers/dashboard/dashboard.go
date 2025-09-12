package dashboard

import (
	"net/http"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	DogsInShelter     int64   `json:"dogs_in_shelter"`
	DogsAdopted       int64   `json:"dogs_adopted"`
	TotalMoneyDonated float64 `json:"total_money_donated"`
	TotalItemsDonated int64   `json:"total_items_donated"`
	VaccinationsGiven int64   `json:"vaccinations_given"`
	DogsSponsored     int64   `json:"dogs_sponsored"`
}

// GetDashboardStats - ดึงสถิติสำหรับ dashboard
func GetDashboardStats(c *gin.Context) {
	db := configs.DB()

	var stats DashboardStats

	// 1. จำนวนสุนัขที่อยู่ในสถานรับเลี้ยง (is_adopted = false)
	db.Model(&entity.Dog{}).Where("is_adopted = ?", false).Count(&stats.DogsInShelter)

	// 2. จำนวนสุนัขที่รับเลี้ยงไปแล้ว (is_adopted = true)
	db.Model(&entity.Dog{}).Where("is_adopted = ?", true).Count(&stats.DogsAdopted)

	// 3. จำนวนเงินที่ได้รับบริจาค (ผลรวม amount จาก money_donations)
	db.Model(&entity.MoneyDonation{}).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalMoneyDonated)

	// 4. จำนวนสิ่งของที่ได้รับบริจาค (ผลรวม quantity จาก item_donations)
	db.Model(&entity.ItemDonation{}).Select("COALESCE(SUM(quantity), 0)").Scan(&stats.TotalItemsDonated)

	// 5. จำนวนวัคซีนที่ฉีดให้สุนัข (นับ vaccination = "YES" จาก medical_records)
	db.Model(&entity.MedicalRecord{}).Where("vaccination = ?", "YES").Count(&stats.VaccinationsGiven)

	// 6. จำนวนสุนัขที่ถูกอุปถัม (นับ unique dog_id จาก sponsorships)
	db.Model(&entity.Sponsorship{}).Distinct("dog_id").Count(&stats.DogsSponsored)

	c.JSON(http.StatusOK, gin.H{
		"message": "Dashboard stats retrieved successfully",
		"data":    stats,
	})
}

// GetDashboardRecentUpdates - ดึงข้อมูลอัปเดตล่าสุด
func GetDashboardRecentUpdates(c *gin.Context) {
	db := configs.DB()

	type RecentUpdate struct {
		DogName     string `json:"dog_name"`
		Note        string `json:"note"`
		Tag         string `json:"tag"`
		UpdatedAt   string `json:"updated_at"`
	}

	var updates []RecentUpdate

	// ดึงข้อมูลจาก medical_records ล่าสุด 5 รายการ
	var medicalRecords []entity.MedicalRecord
	db.Preload("Dog").Order("created_at DESC").Limit(5).Find(&medicalRecords)

	for _, record := range medicalRecords {
		var note string
		var tag string

		if record.Vaccination == "YES" {
			note = "Vaccination completed"
			tag = "Health"
		} else if record.Diagnosis != "" {
			note = "Health checkup completed"
			tag = "Health"
		} else {
			note = "Medical record updated"
			tag = "Health"
		}

		if record.Dog != nil {
			updates = append(updates, RecentUpdate{
				DogName:   record.Dog.Name,
				Note:      note,
				Tag:       tag,
				UpdatedAt: record.CreatedAt.Format("2006-01-02 15:04:05"),
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Recent updates retrieved successfully",
		"data":    updates,
	})
}