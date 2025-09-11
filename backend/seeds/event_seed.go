package seeds

import (
	"time"
	"fmt"
	"os"
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func SeedEvents(db *gorm.DB) error {
	events := []entity.Event{
		{
			Name:        "กิจกรรมฉีดวัคซีนประจำปี",
			Description: stringPtr("เพื่อป้องกันโรคติดต่อของน้องหมา"),
			StartAt:     time.Date(2025, 8, 11, 8, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2025, 8, 11, 18, 0, 0, 0, time.UTC),
			Location:    stringPtr("คลินิกสัตวแพทย์"),
			Organizer:   stringPtr("Member01"),
			ContactInfo: stringPtr("vaccination@animalshelter.com"),
			Capacity:    intPtr(100),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/dog_vaccin.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "กิจกรรมตรวจสุขภาพประจำปี",
			Description: stringPtr("เพื่อตรวจหาโรคในระยะเริ่มต้น"),
			StartAt:     time.Date(2025, 9, 12, 8, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2025, 9, 12, 16, 0, 0, 0, time.UTC),
			Location:    stringPtr("ศูนย์สุขภาพสัตว์"),
			Organizer:   stringPtr("Member02"),
			ContactInfo: stringPtr("health@animalshelter.com"),
			Capacity:    intPtr(80),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/ตรวจสุขภาพประจำปี.png", os.Getenv("HOST"))),
		},
		{
			Name:        "กิจกรรมวิ่งระดมทุน",
			Description: stringPtr("เพื่อระดมทุนสำหรับซื้ออาหารและปัจจัยในการดำรงชีวิตของให้เหล่าสุนัข"),
			StartAt:     time.Date(2024, 7, 2, 8, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2024, 7, 2, 14, 0, 0, 0, time.UTC),
			Location:    stringPtr("สวนสาธารณะลุมพินี"),
			Organizer:   stringPtr("Member02"),
			ContactInfo: stringPtr("fundraising@animalshelter.com"),
			Capacity:    intPtr(200),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/วิ่งระดมทุน.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "กิจกรรมพบปะเหล่าน้องหมา",
			Description: stringPtr("เพื่อหาผู้สนใจรับเลี้ยง"),
			StartAt:     time.Date(2024, 7, 2, 8, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2024, 7, 2, 11, 0, 0, 0, time.UTC),
			Location:    stringPtr("สวนสาธารณะเบญจกิติ"),
			Organizer:   stringPtr("Member02"),
			ContactInfo: stringPtr("adoption@animalshelter.com"),
			Capacity:    intPtr(150),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/พบปะเหล่าน้องหมา.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "กิจกรรมอบรมการดูแลสุนัข",
			Description: stringPtr("อบรมความรู้พื้นฐานในการดูแลสุนัขสำหรับเจ้าของใหม่"),
			StartAt:     time.Date(2025, 10, 15, 9, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2025, 10, 15, 17, 0, 0, 0, time.UTC),
			Location:    stringPtr("ห้องประชุมใหญ่ ชั้น 2"),
			Organizer:   stringPtr("ทีมสัตวแพทย์"),
			ContactInfo: stringPtr("training@animalshelter.com"),
			Capacity:    intPtr(50),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/กิจกรรมอบรมการดูแลสุนัข.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "งานแสดงสุนัขและการประกวด",
			Description: stringPtr("งานแสดงสุนัขประจำปี พร้อมการประกวดในหมวดต่างๆ"),
			StartAt:     time.Date(2025, 11, 20, 10, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2025, 11, 20, 18, 0, 0, 0, time.UTC),
			Location:    stringPtr("ศูนย์การแสดงสินค้าและการประชุม"),
			Organizer:   stringPtr("สมาคมคนรักสุนัข"),
			ContactInfo: stringPtr("dogshow@animalshelter.com"),
			Capacity:    intPtr(300),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/งานแสดงสุนัขและการประกวด.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "กิจกรรมจิตอาสาดูแลสุนัขจรจัด",
			Description: stringPtr("กิจกรรมจิตอาสาช่วยเหลือและดูแลสุนัขจรจัดในชุมชน"),
			StartAt:     time.Date(2025, 12, 5, 7, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2025, 12, 5, 15, 0, 0, 0, time.UTC),
			Location:    stringPtr("ชุมชนคลองเตย"),
			Organizer:   stringPtr("กลุ่มจิตอาสา"),
			ContactInfo: stringPtr("volunteer@animalshelter.com"),
			Capacity:    intPtr(30),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/กิจกรรมจิตอาสาดูแลสุนัขจรจัด.jpg", os.Getenv("HOST"))),
		},
		{
			Name:        "การบรรยายเรื่องโภชนาการสุนัข",
			Description: stringPtr("บรรยายพิเศษเรื่องโภชนาการที่เหมาะสมสำหรับสุนัขในแต่ละช่วงวัย"),
			StartAt:     time.Date(2026, 1, 10, 14, 0, 0, 0, time.UTC),
			EndAt:       time.Date(2026, 1, 10, 17, 0, 0, 0, time.UTC),
			Location:    stringPtr("ห้องประชุมเล็ก ชั้น 3"),
			Organizer:   stringPtr("นักโภชนาการสัตว์"),
			ContactInfo: stringPtr("nutrition@animalshelter.com"),
			Capacity:    intPtr(40),
			ImageURL:    stringPtr(fmt.Sprintf("%s/static/images/events/การบรรยายเรื่องโภชนาการสุนัข.jpg", os.Getenv("HOST"))),
		},
	}

	
	for _, event := range events {
		// Check if event already exists
		var existingEvent entity.Event
		if err := db.Where("name = ?", event.Name).First(&existingEvent).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Event doesn't exist, create it
				if err := db.Create(&event).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}
	}

	return nil
}

// Helper function to create string pointer
func stringPtr(s string) *string {
	return &s
}

// Helper function to create int pointer
func intPtr(i int) *int {
	return &i
}

// Update the main SeedAll function to include events
func SeedAlleven(db *gorm.DB) error {
	// Seed other entities first (users, dogs, etc.)
	// ... existing seed functions ...

	// Seed Events
	if err := SeedEvents(db); err != nil {
		return err
	}

	return nil
}
