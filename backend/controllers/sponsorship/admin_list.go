// controllers/sponsorship/admin_list.go
package sponsorship

import (
	"net/http"
	"strings"
	"time"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminSponsorshipPaymentDTO struct {
	ID             uint      `json:"ID"`
	Amount         int64     `json:"amount"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"CreatedAt"`
	TransactionRef *string   `json:"transaction_ref,omitempty"`
}

type AdminSponsorDTO struct {
	ID        uint    `json:"ID"`
	Kind      string  `json:"kind"` // user | guest
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Email     *string `json:"email,omitempty"`
	Phone     *string `json:"phone,omitempty"`
}

type AdminDogDTO struct {
	ID       uint    `json:"ID"`
	Name     string  `json:"name"`
	PhotoURL *string `json:"photo_url,omitempty"`
}

type AdminSubscriptionDTO struct {
	ID            uint       `json:"ID"`
	Interval      string     `json:"interval"`
	Status        string     `json:"status"`
	NextPaymentAt *time.Time `json:"next_payment_at,omitempty"`
}

type AdminSponsorshipItemDTO struct {
	ID        uint      `json:"ID"`
	CreatedAt time.Time `json:"CreatedAt"`

	PlanType string  `json:"plan_type"` // one-time | subscription
	Amount   int64   `json:"amount"`
	Status   string  `json:"status"`
	Note     *string `json:"note,omitempty"`

	Sponsor AdminSponsorDTO `json:"sponsor"`
	Dog     AdminDogDTO     `json:"dog"`

	Enabled   bool    `json:"enabled"`
	Channel   *string `json:"channel,omitempty"`
	Frequency *string `json:"frequency,omitempty"`

	Subscription        *AdminSubscriptionDTO        `json:"subscription,omitempty"`
	SponsorshipPayments []AdminSponsorshipPaymentDTO `json:"sponsorship_payments,omitempty"`
}

type AdminSponsorshipListResponse struct {
	Items []AdminSponsorshipItemDTO `json:"items"`
}

// GET /admin/sponsorships
func AdminListSponsorships(c *gin.Context) {
	if !isStaffFromCtx(c) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	db := configs.DB()
	var sps []entity.Sponsorship

	if err := db.
		Preload("Sponsor").
		Preload("Sponsor.User").
		Preload("Dog").
		Preload("Subscription").
		Preload("SponsorshipPayments", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("sponsorship_payments.id DESC")
		}).
		Order("sponsorships.id DESC").
		Find(&sps).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, AdminSponsorshipListResponse{Items: []AdminSponsorshipItemDTO{}})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	items := make([]AdminSponsorshipItemDTO, 0, len(sps))
	for _, sp := range sps {
		// sponsor fields
		var first, last, email, phone *string
		kind := ""
		if sp.Sponsor != nil {
			kind = string(sp.Sponsor.Kind)
			if sp.Sponsor.Kind == entity.SponsorKindUser && sp.Sponsor.User != nil {
				first, last = &sp.Sponsor.User.FirstName, &sp.Sponsor.User.LastName
				email, phone = &sp.Sponsor.User.Email, &sp.Sponsor.User.Phone
			} else {
				first, last = sp.Sponsor.FirstName, sp.Sponsor.LastName
				email, phone = sp.Sponsor.Email, sp.Sponsor.Phone
			}
		}
		sponsor := AdminSponsorDTO{
			ID:        sp.SponsorID,
			Kind:      kind,
			FirstName: first,
			LastName:  last,
			Email:     email,
			Phone:     phone,
		}

		// dog
		dog := AdminDogDTO{ID: sp.DogID, Name: ""}
		if sp.Dog != nil {
			dog.Name = sp.Dog.Name
			dog.PhotoURL = &sp.Dog.PhotoURL
		}

		// subscription
		var subDTO *AdminSubscriptionDTO
		if sp.Subscription != nil {
			subDTO = &AdminSubscriptionDTO{
				ID:            sp.Subscription.ID,
				Interval:      sp.Subscription.Interval,
				Status:        sp.Subscription.Status,
				NextPaymentAt: sp.Subscription.NextPaymentAt, // ต้องมี field นี้ใน entity แล้ว
			}
		}

		// payments
		pmDTOs := make([]AdminSponsorshipPaymentDTO, 0, len(sp.SponsorshipPayments))
		for _, p := range sp.SponsorshipPayments {
			var ref *string
			if strings.TrimSpace(p.TransactionRef) != "" {
				r := p.TransactionRef
				ref = &r
			}
			pmDTOs = append(pmDTOs, AdminSponsorshipPaymentDTO{
				ID:             p.ID,
				Amount:         p.Amount,
				Status:         p.Status,
				CreatedAt:      p.CreatedAt,
				TransactionRef: ref,
			})
		}

		items = append(items, AdminSponsorshipItemDTO{
			ID:        sp.ID,
			CreatedAt: sp.CreatedAt,
			PlanType:  sp.PlanType,
			Amount:    sp.Amount,
			Status:    derefStr(sp.Status),
			Note:      sp.Note,

			Sponsor: sponsor,
			Dog:     dog,

			Enabled:   sp.Enabled,
			Channel:   sp.Channel,
			Frequency: sp.Frequency,

			Subscription:        subDTO,
			SponsorshipPayments: pmDTOs,
		})
	}

	c.JSON(http.StatusOK, AdminSponsorshipListResponse{Items: items})
}
