// In file: controllers/donation/donation.go

package donation

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"example.com/project-sa/configs"
	"example.com/project-sa/entity"

)


type CombinedDonationPayload struct {
	DonorInfo            entity.Donor          `json:"donor_info"`
	DonationType         string                `json:"donation_type"`
	MoneyDonationDetails *entity.MoneyDonation `json:"money_donation_details,omitempty"`
	ItemDonationDetails  []entity.ItemDonation `json:"item_donation_details,omitempty"`
}

func CreateDonation(c *gin.Context) {
	var payload CombinedDonationPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	tx := configs.DB().Begin()

	// ✅ --- START: NEW DONOR CHECKING LOGIC ---
	var donorToUse entity.Donor
	incomingDonor := payload.DonorInfo

	if incomingDonor.UserID != nil && *incomingDonor.UserID > 0 {

		if err := tx.Where(entity.Donor{UserID: incomingDonor.UserID}).
			FirstOrCreate(&donorToUse, incomingDonor).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process user donor: " + err.Error()})
			return
		}

	} else {

		if err := tx.Where("first_name = ? AND last_name = ? AND user_id IS NULL", incomingDonor.FirstName, incomingDonor.LastName).
			FirstOrCreate(&donorToUse, incomingDonor).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process guest donor: " + err.Error()})
			return
		}
	}
	donation := entity.Donation{
		DonorID:      donorToUse.ID, // <-- Use ID from the correct donor
		DonationType: payload.DonationType,
		DonationDate: time.Now(),
		Status:       "success",
	}
	if err := tx.Create(&donation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donation record: " + err.Error()})
		return
	}

	// The rest of the function remains the same...
	if payload.DonationType == "money" && payload.MoneyDonationDetails != nil {
		moneyDonation := payload.MoneyDonationDetails
		moneyDonation.DonationID = donation.ID

		if err := tx.Create(moneyDonation).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create money donation: " + err.Error()})
			return
		}
	} else if payload.DonationType == "item" && payload.ItemDonationDetails != nil {
		for _, item := range payload.ItemDonationDetails {
			item.DonationID = donation.ID
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

func GetMyDonations(c *gin.Context) {
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user_id, ok := userIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Find the donor associated with the user ID
	var donor entity.Donor
	if err := configs.DB().Where("user_id = ?", user_id).First(&donor).Error; err != nil {
		// It's possible a user exists but has never donated, so no donor record.
		// In this case, return an empty list, not an error.
		c.JSON(http.StatusOK,[]entity.Donation{})
		return
	}

	// Find all donations for that donor, preloading related data for the frontend
	var donations []entity.Donation
	if err := configs.DB().
		Preload("MoneyDonation.PaymentMethod").
		Preload("ItemDonations").
		Where("donor_id = ?", donor.ID).
		Order("donation_date desc").
		Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch donations: " + err.Error()})
		return
	}

	// Return the donations
	c.JSON(http.StatusOK, donations)
}