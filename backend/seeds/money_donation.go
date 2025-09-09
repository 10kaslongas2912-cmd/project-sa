package seeds

import (
	"example.com/project-sa/entity"
	"gorm.io/gorm"
)

func seedMoneyDonations(db *gorm.DB) error {
	var Donor1 entity.Donor
	if err := db.Where("first_name = ? AND last_name = ?", "John", "Doe").First(&Donor1).Error; err != nil {
		return err
	}
	var Donation1 entity.Donation
	if err := db.First(&Donation1,"donor_id = ?", Donor1.ID).Error; err != nil { return err }

	var PaymentBankTransfer entity.PaymentMethod
	if err := db.Where("name = ?", "พร้อมเพย์").First(&PaymentBankTransfer).Error; err != nil {
		return err
	}

	MoneyDonation1 := entity.MoneyDonation{
		Amount:          1000.00,
		DonationID:      Donation1.ID,           // Link to Donation1
		PaymentMethodID: PaymentBankTransfer.ID, // Link to PaymentMethods
	}
	db.FirstOrCreate(&MoneyDonation1)
	return nil
}
