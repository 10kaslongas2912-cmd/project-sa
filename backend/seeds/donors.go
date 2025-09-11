package seeds

import (
	"example.com/project-sa/entity"
	"example.com/project-sa/utils/pointer"
	"gorm.io/gorm"
)

func seedDonors(db *gorm.DB) error {
	Donor1 := entity.Donor{
		FirstName: pointer.P("John"),
		LastName:  pointer.P("Doe"),
		Email:     pointer.P("john.doe@example.com"),
		Phone:     pointer.P("0812345678"),
		DonorType: pointer.P("guest"),
	}
	Donor2 := entity.Donor{
		FirstName: pointer.P("Jane"),
		LastName:  pointer.P("Smith"),
		Email:     pointer.P("jane.smith@example.com"),
		Phone:     pointer.P("0898765432"),
		DonorType: pointer.P("guest"),
	}

	// if err := db.FirstOrCreate(&Donor1).Error; err != nil { return nil }
	// if err := db.FirstOrCreate(&Donor2).Error; err != nil { return nil }
	db.FirstOrCreate(&Donor1, &entity.Donor{Email: pointer.P("john.doe@example.com")})
	db.FirstOrCreate(&Donor2, &entity.Donor{Email: pointer.P("jane.smith@example.com")})
	return nil
}
