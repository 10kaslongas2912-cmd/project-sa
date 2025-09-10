package main

import (
	"log"
	"net/http"

	"example.com/project-sa/configs"
	adopter "example.com/project-sa/controllers/adoption"
	auth "example.com/project-sa/controllers/auth"
	dog "example.com/project-sa/controllers/dog"
	donation "example.com/project-sa/controllers/donation"
	gender "example.com/project-sa/controllers/gender"
	health_record "example.com/project-sa/controllers/health_record"
	payment_method "example.com/project-sa/controllers/payment_method"
	personalities "example.com/project-sa/controllers/personality"
	sponsorship "example.com/project-sa/controllers/sponsorship"
	user "example.com/project-sa/controllers/user"
	volunteers "example.com/project-sa/controllers/volunteerRegister"
	zcmanagement "example.com/project-sa/controllers/zcmanagement"
	vaccine "example.com/project-sa/controllers/vaccine"
	visit "example.com/project-sa/controllers/visit"
	manage "example.com/project-sa/controllers/manage"
	staffs "example.com/project-sa/controllers/staff"
	"example.com/project-sa/middlewares"
	"example.com/project-sa/migrations"
	"example.com/project-sa/seeds"
	"github.com/gin-gonic/gin"
)

const (
	PORT = "8000"
)

func main() {

	configs.RemoveDBFile()
	db := configs.MustOpenDB()

	if err := migrations.AutoMigrate(db); err != nil {
		log.Fatal(err)
	}
	if err := seeds.SeedAll(db); err != nil {
		log.Fatal(err)
	}

	//  Setup Gin
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Static("/static", "./static")

	//  Routes (public)
	r.POST("/users/auth", auth.SignIn)
	r.POST("/users/signup", auth.SignUp)

	r.GET("/dogs", dog.GetAllDogs)
	r.GET("/dogs/:id", dog.GetDogById)
	r.POST("/dogs", dog.CreateDog)
	r.PUT("/dogs/:id", dog.UpdateDog)	
	r.DELETE("/dogs/:id", dog.DeleteDog)
	// r.POST("/dogs", dogs.CreateDog)
	// r.PUT("/dogs/:id", dogs.UpdateDog)
	// r.DELETE("/dogs/:id", dogs.DeleteDog)
	r.POST("/sponsorships/one-time", sponsorship.CreateOneTimeSponsorship)
	r.GET("/genders", gender.GetAll)
	r.GET("/vaccines", vaccine.GetAll)
	r.GET("/paymentMethods", payment_method.GetAll)

	r.GET("/items", donation.GetAllItems)
	r.GET("/units", donation.GetAllUnits)

	r.GET("/health-records/dog/:id", health_record.GetHealthRecordsByDogId)
	r.POST("/health-records", health_record.CreateHealthRecord)
	r.PUT("/health-records/:id", health_record.UpdateHealthRecord)
	r.DELETE("/health-records/:id", health_record.DeleteHealthRecord)
	r.GET("/health-records/:id", health_record.GetHealthRecordById)
	r.POST("/visits", visit.CreateVisit)
	r.GET("/animal-sexes",dog.GetAllAnimalSexes)
	r.GET("/animal-sizes",dog.GetAllAnimalSizes)
	r.GET("/visits", visit.GetAllVisits)
	r.GET("/visits/:id", visit.GetVisit)
	r.PUT("/visits/:id", visit.UpdateVisit)
	r.DELETE("/visits/:id", visit.DeleteVisit)

	r.POST("/manages", manage.CreateManage)
	r.GET("/manages", manage.GetAllManages)
	r.GET("/manages/:id", manage.GetManageByID)
	r.PUT("/manages/:id", manage.UpdateManage)
	r.DELETE("/manages/:id", manage.DeleteManage)

	// Staff routes
	r.POST("/staffs", staffs.CreateStaff)
	r.GET("/staffs", staffs.GetAllStaffs)
	r.GET("/staffs/:id", staffs.GetStaffById)
	r.PUT("/staffs/:id", staffs.UpdateStaff)
	r.DELETE("/staffs/:id", staffs.DeleteStaff)



	r.GET("/personalities", personalities.GetAllPersonalities)
	r.GET("/breeds", dog.GetAllBreeds)

	r.GET("/zcmanagement", zcmanagement.GetAll)
	r.GET("/zones", zcmanagement.GetZones)
	r.GET("/kennels/:zone_id", zcmanagement.GetKennelsByZone)
	r.GET("/kennel/:kennel_id/dog", zcmanagement.GetDogInKennel)
	r.PUT("/kennel/:kennel_id/dog", zcmanagement.UpdateDogInKennel)
	r.DELETE("/kennel/:kennel_id/dog", zcmanagement.DeleteDogFromKennel)

	r.GET("/volunteers", volunteers.GetAllVolunteers)
	r.GET("/volunteer/:id", volunteers.GetVolunteerByID)
	r.GET("/volunteers/user/:user_id", volunteers.GetVolunteersByUserID)
	r.POST("/volunteer", volunteers.CreateVolunteer)
	r.PUT("/volunteer/:id", volunteers.UpdateVolunteer)
	r.DELETE("/volunteer/:id", volunteers.DeleteVolunteer)
	r.GET("/skills", volunteers.GetAllSkills)     //new
	r.GET("/statusfv", volunteers.GetAllStatusFV) //new
	// 7) Routes (protected)
	protected := r.Group("/")
	protected.Use(middlewares.Authorizes())
	{
		protected.POST("/donations", donation.CreateDonation)
		protected.GET("/users/me", user.Me)
		protected.PUT("/users/:id", user.UpdateUser)
		protected.GET("/users", user.GetAllUsers)
		protected.GET("/users/:id", user.GetUserById)
		protected.DELETE("/users/:id", user.DeleteUser)
		protected.POST("/sponsorships/subscription", sponsorship.CreateSubscriptionSponsorship)
		protected.GET("/my-adoptions", adopter.GetMyCurrentAdoptions)
		protected.GET("/donations/my", donation.GetMyDonations)
		protected.PUT("/donations/:id/status", donation.UpdateDonationStatus)

	}

	// health
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// Adoptions
	r.POST("/adoptions", adopter.CreateAdoption)
	r.GET("/adoptions", adopter.GetAllAdoptions)
	r.PUT("/adoptions/:id/status", adopter.UpdateAdoptionStatus)
	r.DELETE("/adoptions/:id", adopter.DeleteAdoption)

	// 8) Run (แนะนำ bind ทุก iface)
	if err := r.Run("localhost:" + PORT); err != nil {
		log.Fatal(err)
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")	
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
