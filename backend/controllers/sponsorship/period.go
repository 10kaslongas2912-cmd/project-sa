package sponsorship

import (
	"strings"
	"time"

	"example.com/project-sa/entity"
)

func addInterval(from time.Time, interval string) time.Time {
	switch interval {
	case "monthly":
		return from.AddDate(0, 1, 0)
	case "quarterly":
		return from.AddDate(0, 3, 0)
	case "yearly":
		return from.AddDate(1, 0, 0)
	default:
		return from.AddDate(0, 1, 0)
	}
}

// ใช้ของเดิมได้: addInterval(anchor, interval string) time.Time
func lastSucceededPaymentTime(sp entity.Sponsorship, subID uint) time.Time {
	// anchor เริ่มจาก StartDate -> ไม่มีก็ CreatedAt
	anchor := sp.CreatedAt
	if sub := sp.Subscription; sub != nil && !sub.StartDate.IsZero() {
		anchor = sub.StartDate
	}
	for _, p := range sp.SponsorshipPayments {
		if p.SubscriptionID != nil && *p.SubscriptionID == subID && strings.EqualFold(p.Status, "SUCCEEDED") {
			anchor = p.CreatedAt
			break
		}
	}
	return anchor
}
