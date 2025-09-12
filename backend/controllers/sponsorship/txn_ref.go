// controllers/sponsorship/txn_ref.go (ไฟล์เล็กๆ)
package sponsorship

import (
    "crypto/rand"
    "fmt"
    "time"
)

func mockTxnRef(prefix string) string {
    // ตัวอย่าง: OT-20250911-150405-7F2A9C
    b := make([]byte, 3)
    rand.Read(b)
    return fmt.Sprintf("%s-%s-%X", prefix, time.Now().Format("20060102-150405"), b)
}
