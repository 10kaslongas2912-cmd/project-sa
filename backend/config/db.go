package config

import (
	"log"
	"strings"
	"sync"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
)

// ปรับชื่อไฟล์ตามต้องการได้
const DSN = "file:DogShelter.db?cache=shared&_fk=1"

// เปิด DB 1 ครั้ง (thread-safe) และเก็บไว้ที่ตัวแปร global
func MustOpenDB() *gorm.DB {
	once.Do(func() {
		gdb, err := gorm.Open(sqlite.Open(DSN), &gorm.Config{})
		if err != nil {
			log.Fatalf("open db: %v", err)
		}
		// เปิด FK ของ SQLite ให้ชัวร์
		if err := gdb.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
			log.Printf("warn: enable foreign_keys: %v", err)
		}
		db = gdb
	})
	return db
}

// ใช้ดึง instance เดิม ถ้ายังไม่เปิดจะเปิดให้เลย
func DB() *gorm.DB {
	if db == nil {
		return MustOpenDB()
	}
	return db
}

// รีเซ็ตฐาน (SQLite): ปิด FK ชั่วคราว แล้วดรอปทุกตาราง
func ResetDatabase(gdb *gorm.DB) error {
	return gdb.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("PRAGMA foreign_keys = OFF").Error; err != nil {
			return err
		}
		tables, err := tx.Migrator().GetTables()
		if err != nil {
			return err
		}
		for _, t := range tables {
			if strings.HasPrefix(t, "sqlite_") {
				continue
			}
			if err := tx.Migrator().DropTable(t); err != nil {
				log.Printf("drop %s: %v", t, err)
			}
		}
		if err := tx.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
			return err
		}
		return nil
	})
}
