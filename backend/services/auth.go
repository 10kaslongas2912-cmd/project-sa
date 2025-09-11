// services/auth.go
package services

import (
	"errors"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

type JwtClaim struct {
	ID       uint   `json:"ID"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Kind     string `json:"kind,omitempty"` // "user" | "staff"
	jwt.StandardClaims
}

func (j *JwtWrapper) GenerateTokenWithKind(userID uint, username, email, kind string) (string, error) {
	claims := &JwtClaim{
		ID:       userID,
		Username: username,
		Email:    email,
		Kind:     kind,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
			Issuer:    j.Issuer,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.SecretKey))
}

// เดิม: default เป็น "user" (เพื่อ compatibility)
func (j *JwtWrapper) GenerateToken(userID uint, username, email string) (string, error) {
	return j.GenerateTokenWithKind(userID, username, email, "user")
}

// สะดวกใช้ฝั่ง staff
func (j *JwtWrapper) GenerateStaffToken(userID uint, username, email string) (string, error) {
	return j.GenerateTokenWithKind(userID, username, email, "staff")
}

func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
	token, err := jwt.ParseWithClaims(
		signedToken, &JwtClaim{},
		func(token *jwt.Token) (interface{}, error) { return []byte(j.SecretKey), nil },
	)
	if err != nil {
		return
	}
	var ok bool
	claims, ok = token.Claims.(*JwtClaim)
	if !ok {
		err = errors.New("Couldn't parse claims")
		return
	}
	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("JWT is expired")
		return
	}
	return
}
