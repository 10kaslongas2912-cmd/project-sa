package main

import (
	"log"
	"net/http"

	"example.com/project-sa/configs"
	auth "example.com/project-sa/controllers/auth"
	dog "example.com/project-sa/controllers/dog"
	donation "example.com/project-sa/controllers/donation"
	gender "example.com/project-sa/controllers/gender"
	health_record "example.com/project-sa/controllers/health_record"
	payment_method "example.com/project-sa/controllers/payment_method"
	user "example.com/project-sa/controllers/user"
	volunteers "example.com/project-sa/controllers/volunteerRegister"
	zcmanagement "example.com/project-sa/controllers/zcmanagement"
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
	r.POST("/user/auth", auth.SignIn)
	r.POST("/user/signup", auth.SignUp)

	r.GET("/dogs", dog.GetAllDogs)
	r.GET("/dogs/:id", dog.GetDogById)
	// r.POST("/dogs", dogs.CreateDog)
	// r.PUT("/dogs/:id", dogs.UpdateDog)
	// r.DELETE("/dogs/:id", dogs.DeleteDog)

	r.POST("/donations", donation.CreateDonation)
	r.GET("/genders", gender.GetAll)
	r.GET("/paymentMethods", payment_method.GetAll)
	r.GET("/health-records/dog/:id", health_record.GetHealthRecordsByDogId)
	r.POST("/health-records", health_record.CreateHealthRecord)
	r.PUT("/health-records/:id", health_record.UpdateHealthRecord)
	r.DELETE("/health-records/:id", health_record.DeleteHealthRecord)

	r.GET("/zcmanagement", zcmanagement.GetAll)
	r.GET("/zones", zcmanagement.GetZones)
	r.GET("/kennels/:zone_id", zcmanagement.GetKennelsByZone)
	r.GET("/kennel/:kennel_id/dog", zcmanagement.GetDogInKennel)
	r.PUT("/kennel/:kennel_id/dog", zcmanagement.UpdateDogInKennel)
	r.DELETE("/kennel/:kennel_id/dog", zcmanagement.DeleteDogFromKennel)

	r.GET("/volunteers", volunteers.GetAllVolunteers)
	r.GET("/volunteer/:id", volunteers.GetVolunteerByID)
	r.GET("/volunteers/user/:user_id", volunteers.GetVolunteersByUserID)
	r.GET("/volunteers/skill/:skill_id", volunteers.GetVolunteersBySkillID)
	r.POST("/volunteer", volunteers.CreateVolunteer)
	r.PUT("/volunteer/:id", volunteers.UpdateVolunteer)
	r.DELETE("/volunteer/:id", volunteers.DeleteVolunteer)

	// 7) Routes (protected)
	protected := r.Group("/")
	protected.Use(middlewares.Authorizes())
	{
		protected.GET("/user/me", user.Me)
		protected.PUT("/user/:id", user.UpdateUser)
		protected.GET("/users", user.GetAllUsers)
		protected.GET("/user/:id", user.GetUserById)
		protected.DELETE("/user/:id", user.DeleteUser)
	}

	// health
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

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
