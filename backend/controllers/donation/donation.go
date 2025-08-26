package donations

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"example.com/project-sa/config"
	"example.com/project-sa/entity"

)

type CombinedDonationPayload struct {
	DonorInfo            entity.Donor           `json:"donor_info"`
	DonationType         string                 `json:"donation_type"`
	MoneyDonationDetails *entity.MoneyDonations `json:"money_donation_details,omitempty"`
	ItemDonationDetails  []entity.ItemDonations `json:"item_donation_details,omitempty"`
}

func CreateDonation(c *gin.Context) {
	var payload CombinedDonationPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	tx := config.DB().Begin()

	if payload.DonorInfo.UserID != nil {
		var user entity.User
		if err := tx.First(&user, payload.DonorInfo.UserID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
	}

	donor := payload.DonorInfo
	if err := tx.Create(&donor).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donor: " + err.Error()})
		return
	}

	donation := entity.Donations{
		DonorID:      donor.DonorID,
		DonationType: payload.DonationType,
		DonationDate: time.Now(),
		Status:       "success",
	}
	if err := tx.Create(&donation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donation record: " + err.Error()})
		return
	}

	if payload.DonationType == "money" && payload.MoneyDonationDetails != nil {
		moneyDonation := payload.MoneyDonationDetails
		moneyDonation.DonationID = donation.DonationID

		if err := tx.Create(&moneyDonation).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create money donation: " + err.Error()})
			return
		}
	} else if payload.DonationType == "item" && payload.ItemDonationDetails != nil {
		for _, item := range payload.ItemDonationDetails {
			item.DonationID = donation.DonationID
			if err := tx.Create(&item).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item donation: " + err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Donation created successfully"})
}
