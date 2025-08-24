package main

import (
	"net/http"

	"example.com/project-sa/config"
	"example.com/project-sa/controllers/donations"
	"example.com/project-sa/controllers/genders"
	"example.com/project-sa/controllers/users"
	"example.com/project-sa/controllers/payment_methods"
	"example.com/project-sa/controllers/dogs"
	"example.com/project-sa/controllers/health_records"
	"example.com/project-sa/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8000"

func main() {

	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())
	r.Static("/static", "./static") // Add this line to serve static files

	// Auth Route
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)
	r.POST("/donations", donations.CreateDonation)

	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())
		// User Route
		router.PUT("/user/:id", users.Update)
		router.GET("/users", users.GetAll)
		router.GET("/user/:id", users.Get)
		router.DELETE("/user/:id", users.Delete)
	}

	r.GET("/genders", genders.GetAll)
	r.GET("/payment-methods", payment_methods.GetAll)
	r.GET("/dogs/search", dogs.SearchDogs)
	r.GET("/health-records/dog/:id", health_records.GetHealthRecordsByDogId)
	r.POST("/health-records", health_records.CreateHealthRecord)
	r.PUT("/health-records/:id", health_records.UpdateHealthRecord)
	r.DELETE("/health-records/:id", health_records.DeleteHealthRecord)
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})
	// Run the server
	r.Run("localhost:" + PORT)
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