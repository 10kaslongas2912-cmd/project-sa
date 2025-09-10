// middlewares/authorization.go
package middlewares

import (
	"net/http"
	"strings"

	"example.com/project-sa/services"
	"github.com/gin-gonic/gin"
)

func Authorizes() gin.HandlerFunc {
	return func(c *gin.Context) {
		authz := c.Request.Header.Get("Authorization")
		if authz == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			return
		}
		parts := strings.Split(authz, "Bearer ")
		if len(parts) != 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			return
		}
		tokenStr := strings.TrimSpace(parts[1])

		jwtWrapper := services.JwtWrapper{
			SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx", // TODO: os.Getenv("JWT_SECRET")
			Issuer:    "AuthService",
		}
		claims, err := jwtWrapper.ValidateToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// set ตาม kind
		switch claims.Kind {
		case "staff":
			c.Set("staff_id", claims.ID)
			c.Set("staff_username", claims.Username)
			c.Set("staff_email", claims.Email)
		default: // ค่าเดิม/ว่าง → user
			c.Set("user_id", claims.ID)
			c.Set("username", claims.Username)
			c.Set("user_email", claims.Email)
		}
		c.Set("kind", claims.Kind)
		c.Next()
	}
}
