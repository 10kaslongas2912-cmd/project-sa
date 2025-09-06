package configs

import (
	"log"
	"os"
	"sync"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
)

// ชื่อไฟล์ DB (ใช้ประกอบ DSN ด้วย)
const DBFile = "DogShelter.db"

// DSN แบบ URI เปิด FK ด้วย &_fk=1
const DSN = "file:" + DBFile + "?_fk=1&_busy_timeout=5000"

func RemoveDBFile() {
	if _, err := os.Stat(DBFile); err == nil {
		if err := os.Remove(DBFile); err != nil {
			log.Printf("warn: remove db file failed: %v", err)
		} else {
			log.Printf("removed db file: %s", DBFile)
		}
	}
}
// เปิด DB หนึ่งครั้ง (thread-safe) และเก็บ instance ไว้ใช้ซ้ำ
func MustOpenDB() *gorm.DB {
	once.Do(func() {
		gdb, err := gorm.Open(sqlite.Open(DSN), &gorm.Config{})
		if err != nil {
			log.Fatalf("open db: %v", err)
		}

		sqlDB, err := gdb.DB()
		if err != nil {
			log.Fatalf("failed to get generic db object: %v", err)
		}
		sqlDB.SetMaxOpenConns(1)

		// เปิด FK บน SQLite ให้ชัวร์ (เผื่อบาง env ไม่อ่าน &_fk=1)
		if err := gdb.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
			log.Printf("warn: enable foreign_keys: %v", err)
		}
		db = gdb
	})
	return db
}

// ดึง instance เดิม ถ้ายังไม่เปิดจะเปิดให้เอง
func DB() *gorm.DB {
	if db == nil {
		return MustOpenDB()
	}
	return db
}
