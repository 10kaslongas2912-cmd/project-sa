// utils/timeutil/timeutil.go
package timeutil

import "time"

func TZBangkok() *time.Location {
    loc, _ := time.LoadLocation("Asia/Bangkok")
    return loc
}

// วันที่ล้วนวันนี้ในไทย -> "YYYY-MM-DD"
func TodayYMD() string {
    return time.Now().In(TZBangkok()).Format("2006-01-02")
}

// แปลงสตริง "YYYY-MM-DD" ให้ตรวจสอบความถูกต้อง (ไม่ต้องเก็บ time.Time ก็ได้)
func ValidateYMD(s string) bool {
    _, err := time.ParseInLocation("2006-01-02", s, TZBangkok())
    return err == nil
}