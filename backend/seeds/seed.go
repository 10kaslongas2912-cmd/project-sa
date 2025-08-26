package seeds

import (
	"fmt"
	"time"

	"example.com/project-sa/entity"
	"example.com/project-sa/services"
	"gorm.io/gorm"
)

/* ============== Public ============== */
const PublicBaseURL = "http://localhost:8000" // ปรับตามจริง

func SeedAll(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := seedRoles(tx); err != nil { return err }
		if err := seedStaffUsers(tx); err != nil { return err }
		if err := seedStaff(tx); err != nil { return err }

		if err := seedLookupsBase(tx); err != nil { return err } // PaymentMethod, Gender, AnimalSex, Breed
		if err := seedKennels(tx); err != nil { return err }     // ต้องหลัง Staff (เพราะมี FK StaffID)
		if err := seedDogs(tx); err != nil { return err }        // ต้องหลัง Kennels/Breeds/Sex

		return nil
	})
}

/* ============== Helpers ============== */

func bulkCreate[T any](db *gorm.DB, rows []T) error {
	if len(rows) == 0 { return nil }
	return db.Create(&rows).Error
}

func mustFindBy[T any](db *gorm.DB, field string, value any, out *T) error {
	return db.Where(field+" = ?", value).First(out).Error
}

/* ============== 1) Roles ============== */

func seedRoles(db *gorm.DB) error {
	// ปรับชื่อ role ตามที่โปรเจกต์คุณใช้จริง
	return bulkCreate(db, []entity.Role{
		{Name: "Handler"},
		{Name: "Manager"},
		// {Name: "Vet"},
	})
}


/* ============== 2) Users สำหรับ Staff ============== */

func seedStaffUsers(db *gorm.DB) error {
	pw, _ := services.HashPassword("10K")

	users := []entity.User{
		{
			FirstName: "Default", LastName: "Handler",
			Email: "handler@example.com", PhoneNumber: "0000000000",
			UserName: "handler", Password: pw,
			DateOfBirth: time.Date(1990,1,1,0,0,0,0,time.UTC),
		},
		{
			FirstName: "Kennel", LastName: "Manager",
			Email: "manager@example.com", PhoneNumber: "0999999999",
			UserName: "manager", Password: pw,
			DateOfBirth: time.Date(1990,1,1,0,0,0,0,time.UTC),
		},
	}
	return bulkCreate(db, users)
}

/* ============== 3) Staff ============== */

func seedStaff(db *gorm.DB) error {
	var handlerRole, managerRole entity.Role
	if err := mustFindBy(db, "name", "Handler", &handlerRole); err != nil { return err }
	if err := mustFindBy(db, "name", "Manager", &managerRole); err != nil { return err }

	var uHandler, uManager entity.User
	if err := mustFindBy(db, "email", "handler@example.com", &uHandler); err != nil { return err }
	if err := mustFindBy(db, "email", "manager@example.com", &uManager); err != nil { return err }

	staffs := []entity.Staff{
		{UserID: uHandler.ID, RoleID: handlerRole.ID},
		{UserID: uManager.ID, RoleID: managerRole.ID},
	}
	return bulkCreate(db, staffs)
}

/* ============== 4) Lookups base (ไม่มี Kennel ที่ผูก Staff) ============== */

func seedLookupsBase(db *gorm.DB) error {
	// Payment methods
	if err := bulkCreate(db, []entity.PaymentMethod{
		{Name: "บัตรเครดิต"},
		{Name: "โอนเงินผ่านธนาคาร"},
	}); err != nil { return err }

	// Gender (human)
	if err := bulkCreate(db, []entity.Gender{
		{Gender: "ชาย"},
		{Gender: "หญิง"},
	}); err != nil { return err }

	// Animal sex
	if err := bulkCreate(db, []entity.AnimalSex{
		{AnimalSex: "male"},
		{AnimalSex: "female"},
		{AnimalSex: "unknown"},
	}); err != nil { return err }

	// Breeds
	if err := bulkCreate(db, []entity.Breed{
		{BreedName: "Golden Retriever", Description: "Friendly and intelligent."},
		{BreedName: "Poodle",           Description: "Intelligent and active."},
		{BreedName: "Bulldog",          Description: "Calm and courageous."},
	}); err != nil { return err }

	return nil
}

/* ============== 5) Kennels (โยง StaffID) ============== */

func seedKennels(db *gorm.DB) error {
	// ใช้พนักงานที่สร้างไว้
	var staffHandler, staffManager entity.Staff
	// เลือกจาก role (หรือเลือกจาก email user ก็ได้)
	if err := db.Joins("Role").Where("role.name = ?", "Handler").First(&staffHandler).Error; err != nil { return err }
	if err := db.Joins("Role").Where("role.name = ?", "Manager").First(&staffManager).Error; err != nil { return err }

	return bulkCreate(db, []entity.Kennel{
		{Location: "Zone A", Capacity: 10, Color: "Blue",  Notes: "Quiet area",  StaffID: staffHandler.ID},
		{Location: "Zone B", Capacity:  8, Color: "Green", Notes: "Playful area", StaffID: staffManager.ID},
	})
}

/* ============== 6) Dogs ============== */

func seedDogs(db *gorm.DB) error {
	var sexMale, sexFemale entity.AnimalSex
	if err := mustFindBy(db, "animal_sex", "male", &sexMale); err != nil { return err }
	if err := mustFindBy(db, "animal_sex", "female", &sexFemale); err != nil { return err }

	var golden, poodle, bulldog entity.Breed
	if err := mustFindBy(db, "breed_name", "Golden Retriever", &golden); err != nil { return err }
	if err := mustFindBy(db, "breed_name", "Poodle", &poodle); err != nil { return err }
	if err := mustFindBy(db, "breed_name", "Bulldog", &bulldog); err != nil { return err }

	var kenA, kenB entity.Kennel
	if err := mustFindBy(db, "location", "Zone A", &kenA); err != nil { return err }
	if err := mustFindBy(db, "location", "Zone B", &kenB); err != nil { return err }

	return bulkCreate(db, []entity.Dog{
		{
			Name:        "Buddy",
			AnimalSexID: sexMale.ID,
			DateOfBirth: time.Date(2022, 5, 10, 0, 0, 0, 0, time.UTC),
			DateArrived: time.Date(2023, 1, 15, 0, 0, 0, 0, time.UTC),
			IsAdopted:   false,
			PhotoURL:    "http://localhost:8000/static/images/dog/dog1.jpg",
			Character:   "Playful",
			BreedID:     golden.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,
		},
		{
			Name:        "Lucy",
			AnimalSexID: sexFemale.ID,
			DateOfBirth: time.Date(2021, 8, 20, 0, 0, 0, 0, time.UTC),
			DateArrived: time.Date(2022, 10, 1, 0, 0, 0, 0, time.UTC),
			IsAdopted:   false,
			PhotoURL:    fmt.Sprintf("%s/static/images/dog/dog4.jpg",PublicBaseURL),
			Character:   "Calm",
			BreedID:     poodle.ID,
			KennelID:    kenB.ID,
			ReadyToAdopt: true,

		},
		{
			Name:        "Max",
			AnimalSexID: sexMale.ID,
			DateOfBirth: time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC),
			DateArrived: time.Date(2023, 6, 1, 0, 0, 0, 0, time.UTC),
			IsAdopted:   false,
			PhotoURL:    "http://localhost:8000/static/images/dog/dog2.jpg",
			Character:   "Energetic",
			BreedID:     bulldog.ID,
			KennelID:    kenA.ID,
			ReadyToAdopt: true,

		},
	})
}
