package verify

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
	"time"

	"crypto/rand"
	"encoding/base64"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// TokenClaims defines the structure of the JWT claims
type TokenClaims struct {
	Username string `json:"username"`
	Salt     string `json:"salt"` // Add salt to the claims
	jwt.StandardClaims
}

// generateSalt generates a random salt value
func generateSalt() (string, error) {
	salt := make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(salt), nil
}

// generateJWT creates a new JWT with salt
func generateJWT(username string, secretKey string, ttl time.Duration) (string, error) {
	salt, err := generateSalt()
	if err != nil {
		return "", err
	}
	claims := &TokenClaims{
		Username: username,
		Salt:     salt,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(ttl).Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// TokenHandler handles token creation
func TokenHandler(c *gin.Context) {
	var requestBody struct {
		Username string `json:"username" binding:"required"`
	}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	username := requestBody.Username
	secretKey := "yourSecretKey" // replace with your actual secret key
	ttl := time.Hour             // replace with desired time-to-live duration

	tokenString, err := generateJWT(username, secretKey, ttl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{"response": tokenString})
}

// AuthResponse defines the structure for authentication response
type AuthResponse struct {
	AccessToken  string `json:"accesstoken"`
	RefreshToken string `json:"refreshtoken"`
}

// Token configures token properties
type Token struct {
	SecretKey       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

var tokenConfig = Token{
	SecretKey:       "yourSecretKey", // replace with your actual secret key
	AccessTokenTTL:  time.Hour,       // replace with desired access token TTL
	RefreshTokenTTL: time.Hour * 24,  // replace with desired refresh token TTL
}

// User defines the structure of a user
type User struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// handleRefreshToken handles token refresh
func handleRefreshToken(c *gin.Context) {
	var req AuthResponse

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	claims := &TokenClaims{}
	_, err := jwt.ParseWithClaims(req.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(tokenConfig.SecretKey), nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid refresh token"})
		return
	}

	newToken, err := generateJWT(claims.Username, tokenConfig.SecretKey, tokenConfig.AccessTokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := AuthResponse{
		AccessToken: newToken,
	}

	c.JSON(http.StatusAccepted, gin.H{"response": response})
}

// handleInsertSignUp handles user sign-up
func handleInsertSignUp(c *gin.Context, db *sql.DB, user User) error {
	query := `INSERT INTO users (username, email, phone, password) VALUES($1, $2, $3, $4)`
	_, err := db.Exec(query, user.Username, user.Email, user.Phone, user.Password)
	return err
}

// HandleSignUp handles the sign-up request
func HandleSignUp(c *gin.Context, db *sql.DB) {
	var user User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Enter all the required information"})
		return
	}

	if db != nil {
		if err := handleInsertSignUp(c, db, user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while inserting the data into the database"})
			return
		}
	}

	c.JSON(http.StatusAccepted, gin.H{"response": "Successfully Inserted"})
}

var secretKey = "yourSharedSecretKey"

// AuthMiddlewares returns a middleware for authentication
func AuthMiddlewares() gin.HandlerFunc {
	return func(c *gin.Context) {
		isValid, claims, err := verifyToken(c)
		if err != nil || !isValid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		c.Set("username", claims.Username)
		c.Next()
	}
}

// verifyToken verifies the JWT token
func verifyToken(c *gin.Context) (bool, *TokenClaims, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false, nil, errors.New("Authorization header is missing")
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		return false, nil, errors.New("Invalid Authorization header format")
	}

	claims := &TokenClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil || !token.Valid {
		return false, nil, errors.New("Invalid token")
	}

	return true, claims, nil
}

// ProtectedFeatureHandler handles access to a protected feature
func ProtectedFeatureHandler(c *gin.Context) {
	username := c.GetString("username")
	if username == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Your protected feature logic here
	c.JSON(http.StatusOK, gin.H{"response": "access granted"})
}
