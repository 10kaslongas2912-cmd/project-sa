package seeds

import (
	"fmt"
	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"gorm.io/gorm"
	"example.com/project-sa/utils/pointer"
)

/* ============== Public ============== */
const PublicBaseURL = "http://localhost:8000" // ปรับตามจริง

var pw, _ = services.HashPassword("10K")

func SeedAll(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := seedLookupsBase(tx); err != nil {
			return err
		}
		if err := seedStaffs(tx); err != nil {
			return err
		}
		if err := seedUsers(tx); err != nil {
			return err
		}
		if err := seedKennels(tx); err != nil {
			return err
		}
		if err := seedDogs(tx); err != nil {
			return err
		}

		return nil
	})
}

/* ============== Helpers ============== */

func bulkCreate[T any](db *gorm.DB, rows []T) error {
	if len(rows) == 0 {
		return nil
	}
	return db.Create(&rows).Error
}

func mustFindBy[T any](db *gorm.DB, field string, value any, out *T) error {
	return db.Where(field+" = ?", value).First(out).Error
}


/* ============== Lookup ============== */
func seedLookupsBase(db *gorm.DB) error {
	// Payment methods
	if err := bulkCreate(db, []entity.PaymentMethod{
		{Name: "บัตรเครดิต"},
		{Name: "โอนเงินผ่านธนาคาร"},
	}); err != nil {
		return err
	}

	// Gender (human)
	if err := bulkCreate(db, []entity.Gender{
		{Gender: "ชาย"},
		{Gender: "หญิง"},
	}); err != nil {
		return err
	}

	if err := bulkCreate(db, []entity.Role{
		{Name: "Handler"},
		{Name: "Manager"},
	}); err != nil {
		return err
	}
	// Animal sex
	if err := bulkCreate(db, []entity.AnimalSex{
		{AnimalSex: "ตัวผู้"},
		{AnimalSex: "ตัวเมีย"},
	}); err != nil {
		return err
	}

	if err := bulkCreate(db, []entity.AnimalSize{
		{AnimalSize: "เล็ก"},
		{AnimalSize: "กลาง"},
		{AnimalSize: "ใหญ่"},
	}); err != nil {
		return err
	}
	// Breeds
	if err := bulkCreate(db, []entity.Breed{
		{BreedName: "Golden Retriever", Description: "Friendly and intelligent."},
		{BreedName: "Poodle", Description: "Intelligent and active."},
		{BreedName: "Bulldog", Description: "Calm and courageous."},
	}); err != nil {
		return err
	}

	if err := bulkCreate(db, []entity.Zone{
		{ZoneName: "Zone A"},
		{ZoneName: "Zone B"},
	}); err != nil {
		return err
	}

	return nil
}

func seedUsers(db *gorm.DB) error {
	if err := bulkCreate(db, []entity.PaymentMethod{
		{Name: "บัตรเครดิต"},
		{Name: "โอนเงินผ่านธนาคาร"},
		{Name: "พร้อมเพย์"},
	}); err != nil {
		return err
	}
	return nil
}

func seedStaffs(db *gorm.DB) error {

	var handlerRole, managerRole entity.Role
	if err := mustFindBy(db, "name", "Handler", &handlerRole); err != nil {
		return fmt.Errorf("seedStaff: role Handler not found: %w", err)
	}
	if err := mustFindBy(db, "name", "Manager", &managerRole); err != nil {
		return fmt.Errorf("seedStaff: role Manager not found: %w", err)
	}

	var male, female entity.Gender
	if err := mustFindBy(db, "gender", "ชาย", &male); err != nil {
		return err
	}
	if err := mustFindBy(db, "gender", "หญิง", &female); err != nil {
		return err
	}

	var zoneA,zoneB entity.Zone
	if err := mustFindBy(db, "zone_name", "Zone A", &zoneA); err != nil {
		return err
	}
	if err := mustFindBy(db, "zone_name", "Zone B", &zoneB); err != nil {
		return err
	}
	// var zones []entity.Zone
	// if err := db.Find(&zones).Error; err != nil {
	// 	return err
	// }

	// zoneA := zones[0]
	// zoneB := zones[1]

	active := "active"
	onLeave := "on_leave"

	staffs := []entity.Staff{
		{
			Firstname:   "Pongsak",
			Lastname:    "Suwan",
			Username:    "manager1",
			Password:    pw, // bcrypt
			GenderID:    male.ID,
			RoleID:      managerRole.ID,
			DateOfBirth: "1990-02-10",
			Phone:       "0810000001",
			Email:       "manager1@example.com",
			Status:      &active,
			Note:        pointer.P("General manager"),
			ZoneID:      zoneA.ID,
		},
		{
			Firstname:   "Nattaya",
			Lastname:    "Chaiyasit",
			Username:    "manager2",
			Password:    pw,
			GenderID:    female.ID,
			RoleID:      managerRole.ID,
			DateOfBirth: "1992-06-25",
			Phone:       "0810000002",
			Email:       "manager2@example.com",
			Status:      &active,
			Note:        pointer.P("Ops manager"),
			ZoneID:      zoneB.ID,
		},
		{
			Firstname:   "Anurak",
			Lastname:    "Kittisak",
			Username:    "handler1",
			Password:    pw,
			GenderID:    male.ID,
			RoleID:      handlerRole.ID,
			DateOfBirth: "1998-01-15",
			Phone:       "0810001001",
			Email:       "handler1@example.com",
			Status:      &active,
			Note:        pointer.P("Day shift"),
			ZoneID:      zoneA.ID,
		},
		{
			Firstname:   "Suphansa",
			Lastname:    "Boonyarit",
			Username:    "handler2",
			Password:    pw,
			GenderID:    female.ID,
			RoleID:      handlerRole.ID,
			DateOfBirth: "1999-07-21",
			Phone:       "0810001002",
			Email:       "handler2@example.com",
			Status:      &onLeave,
			Note:        pointer.P("On leave this week"),
			ZoneID:      zoneB.ID,
		},
		{
			Firstname:   "Thanakorn",
			Lastname:    "Siriwat",
			Username:    "handler3",
			Password:    pw,
			GenderID:    male.ID,
			RoleID:      handlerRole.ID,
			DateOfBirth: "2000-12-03",
			Phone:       "0810001003",
			Email:       "handler3@example.com",
			Status:      &active,
			ZoneID:      zoneA.ID,
		},
		{
			Firstname:   "Kanyarat",
			Lastname:    "Prasert",
			Username:    "handler4",
			Password:    pw,
			GenderID:    female.ID,
			RoleID:      handlerRole.ID,
			DateOfBirth: "2001-05-30",
			Phone:       "0810001004",
			Email:       "handler4@example.com",
			Status:      &active,
			ZoneID:      zoneB.ID,
		},
	}

	return bulkCreate(db, staffs)
}

/* ============== 4) Lookups base (ไม่มี Kennel ที่ผูก Staff) ============== */

/* ============== 5) Kennels (โยง StaffID) ============== */

func seedKennels(db *gorm.DB) error {
	var zoneA,zoneB entity.Zone
	if err := mustFindBy(db, "zone_name", "Zone A", &zoneA ); err != nil { return err}
	if err := mustFindBy(db, "zone_name", "Zone B", &zoneB ); err != nil { return err}

	return bulkCreate(db, []entity.Kennel{
		{Capacity: 10, Color: "Blue", Note: pointer.P("Quiet area"), ZoneID: zoneA.ID },
		{Capacity: 8, Color: "Green", Note: pointer.P("Playful area"), ZoneID: zoneB.ID},
	})
}

/* ============== 6) Dogs ============== */

func seedDogs(db *gorm.DB) error {
	var sexMale, sexFemale entity.AnimalSex
	if err := mustFindBy(db, "animal_sex", "ตัวผู้", &sexMale); err != nil {
		return err
	}
	if err := mustFindBy(db, "animal_sex", "ตัวเมีย", &sexFemale); err != nil {
		return err
	}

	var sizeSmall,sizeMedium,sizeLarge entity.AnimalSize
	if err := mustFindBy(db, "animal_size", "เล็ก", &sizeSmall ); err != nil {
		return err
	}
	if err := mustFindBy(db, "animal_size", "กลาง", &sizeMedium ); err != nil {
		return err
	}
	if err := mustFindBy(db, "animal_size", "ใหญ่", &sizeLarge ); err != nil {
		return err
	}

	var golden, poodle, bulldog entity.Breed
	if err := mustFindBy(db, "breed_name", "Golden Retriever", &golden); err != nil {
		return err
	}
	if err := mustFindBy(db, "breed_name", "Poodle", &poodle); err != nil {
		return err
	}
	if err := mustFindBy(db, "breed_name", "Bulldog", &bulldog); err != nil {
		return err
	}

	var kenA, kenB entity.Kennel
	if err := mustFindBy(db, "id", "1", &kenA); err != nil {
		return err
	}
	if err := mustFindBy(db, "id", "2", &kenB); err != nil {
		return err
	}

	return bulkCreate(db, []entity.Dog{
		{
			Name:        "Tor",
			AnimalSexID: sexMale.ID,
			AnimalSizeID: sizeSmall.ID,
			DateOfBirth: "2012-08-09",
			DateOfArrived: "2012-12-01",
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog1.jpg", PublicBaseURL),
			Character:   "Playful",
			BreedID:     golden.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,
		},
		{
			Name:        "Taa",
			AnimalSexID: sexFemale.ID,
			AnimalSizeID: sizeMedium.ID,
			DateOfBirth: "1995-10-09",
			DateOfArrived: "1999-04-09",
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog2.jpg", PublicBaseURL),
			Character:   "Calm",
			BreedID:     poodle.ID,
			KennelID:    kenB.ID,
			ReadyToAdopt: true,
		},
		{
			Name:        "Jia",
			AnimalSexID: sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			DateOfBirth: "2010-12-01",
			DateOfArrived: "2011-10-02",
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog3.jpg", PublicBaseURL),
			Character:   "Energetic",
			BreedID:     bulldog.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,
		},
		{
			Name:        "Sam",
			AnimalSexID: sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			DateOfBirth: "2022-12-01",
			DateOfArrived: "2023-10-02",
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog5.jpg", PublicBaseURL),
			Character:   "Energetic",
			BreedID:     bulldog.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,
		},
		{
			Name:        "Nam",
			AnimalSexID: sexMale.ID,
			AnimalSizeID: sizeLarge.ID,
			DateOfBirth: "2025-01-01",
			DateOfArrived: "2025-01-02",
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog6.jpg", PublicBaseURL),
			Character:   "Energetic",
			BreedID:     bulldog.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,
		},
	})
}