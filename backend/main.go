package main

import (
	"log"
	"net/http"
	"example.com/project-sa/config"
	donations "example.com/project-sa/controllers/donation"
	dogs "example.com/project-sa/controllers/dog"
	genders "example.com/project-sa/controllers/gender"
	health_records "example.com/project-sa/controllers/health_record"
	payment_methods "example.com/project-sa/controllers/payment_method"
	users "example.com/project-sa/controllers/user"
	"example.com/project-sa/middlewares"
	"example.com/project-sa/migrations"
	"github.com/gin-gonic/gin"
	"example.com/project-sa/seeds"
)

const (
	PORT = "8000"
)

func main() {
	db := config.MustOpenDB()

	if err := config.ResetDatabase(db); err != nil { log.Fatal(err) }
	if err := migrations.AutoMigrate(db); err != nil { log.Fatal(err) }
	if err := seeds.SeedAll(db); err != nil { log.Fatal(err) }

	//  Setup Gin
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Static("/static", "./static")

	//  Routes (public)
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)

	r.GET("/dogs", dogs.GetAllDogs)
	r.GET("/dogs/:id", dogs.GetDogByID)
	// r.POST("/dogs", dogs.CreateDog)
	// r.PUT("/dogs/:id", dogs.UpdateDog)
	// r.DELETE("/dogs/:id", dogs.DeleteDog)

	r.POST("/donations", donations.CreateDonation)
	r.GET("/genders", genders.GetAll)
	r.GET("/payment-methods", payment_methods.GetAll)
	r.GET("/health-records/dog/:id", health_records.GetHealthRecordsByDogId)
	r.POST("/health-records", health_records.CreateHealthRecord)
	r.PUT("/health-records/:id", health_records.UpdateHealthRecord)
	r.DELETE("/health-records/:id", health_records.DeleteHealthRecord)

	// 7) Routes (protected)
	protected := r.Group("/")
	protected.Use(middlewares.Authorizes())
	{
		protected.PUT("/user/:id", users.Update)
		protected.GET("/users", users.GetAll)
		protected.GET("/user/:id", users.Get)
		protected.DELETE("/user/:id", users.Delete)
	}

	// health
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// 8) Run (แนะนำ bind ทุก iface)
	if err := r.Run(":" + PORT); err != nil {
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
