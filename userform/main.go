package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"golang.org/x/crypto/bcrypt"
)

type config struct {
	db struct {
		dsn string
	}
	jwt struct {
		secretKey       string
		accessTokenTTL  time.Duration
		refreshTokenTTL time.Duration
	}
}

type FormData struct {
	ID                 int       `json:"id"`
	Location           string    `json:"location"`
	Latitude           float64   `json:"latitude"`
	Longitude          float64   `json:"longitude"`
	SelectPole         string    `json:"selectpole"`
	SelectPoleStatus   string    `json:"selectpolestatus"`
	SelectPoleLocation string    `json:"selectpolelocation"`
	Description        string    `json:"description"`
	PoleImage          string    `json:"poleimage_url"`
	AvailableISP       string    `json:"availableisp"`
	SelectISP          string    `json:"selectisp"`
	MultipleImages     []string  `json:"multipleimages_urls"`
	CreatedAt          time.Time `json:"created_at"`
}

type StartEnd struct {
	Username              string     `json:"username"`
	TripStarted           bool       `json:"tripStarted"`
	TripStartTime         *time.Time `json:"tripStartTime"`
	TripEndTime           *time.Time `json:"tripEndTime"`
	OriginalTripStartTime *time.Time `json:"originalTripStartTime"`
}

type GPSData struct {
	ID        int       `json:"id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Date      time.Time `json:"date"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type PasswordChanger struct {
	Username    string `json:"username"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type TokenClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func handleWebSocketConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading the websocket connection:", err)
		return
	}
	defer conn.Close()

	// Simulate sending GPS data every 2 seconds
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// Generate fake GPS data
		fakeData := []FormData{
			{Latitude: 27.6714893, Longitude: 85.3120526}, // Initial position
			{Latitude: 27.6715, Longitude: 85.3121},       // Fake position update
			{Latitude: 27.6716, Longitude: 85.3222},       // Fake position update
			{Latitude: 27.6717, Longitude: 85.3223},       // Fake position update
			// Add more fake data as needed
		}

		// Convert GPS data to JSON
		jsonData, err := json.Marshal(fakeData)
		if err != nil {
			log.Println("Error encoding GPS data:", err)
			continue
		}

		err = conn.WriteMessage(websocket.TextMessage, jsonData)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Println("Error writing GPS data to the websocket:", err)
			}
			break
		}

	}
}

func handleInsertUserDetails(db *sql.DB, user User) error {
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		return err
	}
	query := `INSERT INTO users (username, email, phone , password ) VALUES ($1,$2,$3,$4)`
	_, err = db.Exec(query, user.Username, user.Email, user.Phone, hashedPassword)
	if err != nil {
		return err
	}
	return nil

}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func handleUserSignup(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userData User
		if err := json.NewDecoder(r.Body).Decode(&userData); err != nil {
			log.Printf("Error decoding the json data: %v", err)
			http.Error(w, "Error decoding the json data", http.StatusInternalServerError)
			return
		}
		if db != nil {
			if err := handleInsertUserDetails(db, userData); err != nil {
				log.Printf("Error inserting the data into the database:%v", err)
				http.Error(w, "Error inserting the data into the database", http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Data inserted Sucessfully"))

	}
}

func generateJWT(username string, secretKey string, ttl time.Duration) (string, error) {
	claims := TokenClaims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(ttl).Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

func handleUserLogin(db *sql.DB, cfg config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req User
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error decoding the request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := "SELECT password FROM users WHERE username = $1"
		var storedPassword string
		err := db.QueryRow(query, req.Username).Scan(&storedPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("Username is not registered in the database: %v", req.Email)
				http.Error(w, "Username not registered", http.StatusUnauthorized)
				return
			}
			log.Printf("Error querying database: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if !checkPasswordHash(req.Password, storedPassword) {
			log.Printf("Password does not match for email: %v", req.Email)
			http.Error(w, "Invalid password", http.StatusUnauthorized)
			return
		}

		accessToken, err := generateJWT(req.Username, cfg.jwt.secretKey, cfg.jwt.accessTokenTTL)
		if err != nil {
			log.Printf("Error generating access token: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		refreshToken, err := generateJWT(req.Username, cfg.jwt.secretKey, cfg.jwt.refreshTokenTTL)
		if err != nil {
			log.Printf("Error generating refresh token: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		response := AuthResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		w.Write([]byte("Login successfully done"))
	}
}

func handleRefreshToken(cfg config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AuthResponse
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error decoding the request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		claims := &TokenClaims{}
		_, err := jwt.ParseWithClaims(req.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.jwt.secretKey), nil
		})
		if err != nil {
			log.Printf("Invalid refresh token: %v", err)
			http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
			return
		}

		newAccessToken, err := generateJWT(claims.Username, cfg.jwt.secretKey, cfg.jwt.accessTokenTTL)
		if err != nil {
			log.Printf("Error generating new access token: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		response := AuthResponse{
			AccessToken: newAccessToken,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func handlePasswordChanger(db *sql.DB, cfg config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req PasswordChanger
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error decoding the json request:%v", err)
			http.Error(w, "Error decoding the json request", http.StatusInternalServerError)
			return
		}

		query := `SELECT password FROM users WHERE username= $1`
		var storedPassword string
		err := db.QueryRow(query, req.Username).Scan(&storedPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("Email is not registered in the database:%v", req.Username)
				http.Error(w, "Email is not registered in the database", http.StatusInternalServerError)
				return
			}
			log.Printf("Error querying the database:%v", err)
			http.Error(w, "Error querying the database", http.StatusInternalServerError)
			return

		}
		if !checkPasswordHash(req.OldPassword, storedPassword) {
			log.Printf("Password does not match for the email:%v", req.Username)
			http.Error(w, "Password Invalid", http.StatusInternalServerError)
			return
		}

		hashedPassword, err := hashPassword(req.NewPassword)
		if err != nil {
			log.Printf("Error hashing the new password:%v", err)
			http.Error(w, "Error hashing the new Password", http.StatusInternalServerError)
			return
		}
		UpdateQuery := `UPDATE users SET password = $1 WHERE username = $2`
		_, err = db.Exec(UpdateQuery, hashedPassword, req.Username)
		if err != nil {
			log.Printf("Error updating password in the database: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Password updated successfully")

	}
}
func getTripData(db *sql.DB, username string) (*StartEnd, error) {
	query := "SELECT username, trip_started, trip_start_time, trip_end_time, original_trip_start_time FROM trip WHERE username = $1 ORDER BY id DESC LIMIT 1"
	row := db.QueryRow(query, username)

	var trip StartEnd
	err := row.Scan(&trip.Username, &trip.TripStarted, &trip.TripStartTime, &trip.TripEndTime, &trip.OriginalTripStartTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No trip data found
		}
		return nil, fmt.Errorf("failed to retrieve trip data: %w", err)
	}

	return &trip, nil
}

func handleTripStart(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer c.Request.Body.Close()

		body, err := io.ReadAll(c.Request.Body)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var RequestBody struct {
			Username string `json:"username"`
		}

		if err := c.ShouldBindJSON(&RequestBody); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get the username"})
			return

		}

		existingTrip, err := getTripData(db, RequestBody.Username)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unable to get the existing the trip"})
			return
		}

		if existingTrip != nil && existingTrip.TripStarted {
			c.JSON(http.StatusAccepted, gin.H{"response": "Trip already started"})
			return
		}

		tripStartTime := time.Now()
		var originalTripStartTime time.Time
		if existingTrip != nil && existingTrip.OriginalTripStartTime != nil {
			originalTripStartTime = *existingTrip.OriginalTripStartTime
		} else {
			originalTripStartTime = tripStartTime
		}

		startEnd := StartEnd{
			Username:              RequestBody.Username,
			TripStarted:           true,
			TripStartTime:         &tripStartTime,
			TripEndTime:           nil,
			OriginalTripStartTime: &originalTripStartTime,
		}

		err = upsertTripData(db, startEnd)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{"response": startEnd})
		c.JSON(http.StatusAccepted, gin.H{"response": "Trip started successfully"})

	}
}

func handleEndTrips(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var requestBody struct {
			Username string `json:"username"`
		}

		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusInternalServerError, "Username is missing")
			return
		}

		existingTrip, err := getTripData(db, requestBody.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get the trip data"})
			return
		}

		if existingTrip == nil || !existingTrip.TripStarted {
			c.JSON(http.StatusInternalServerError, gin.H{"error": " NO Trip in progress"})
			return
		}

		TripEndTime := time.Now()

		startEnd := StartEnd{
			Username:              requestBody.Username,
			TripStarted:           false,
			TripStartTime:         existingTrip.TripStartTime,
			TripEndTime:           &TripEndTime,
			OriginalTripStartTime: existingTrip.OriginalTripStartTime,
		}

		err = upsertTripData(db, startEnd)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		activeTripsMutex.Lock()
		delete(activeTrips, requestBody.Username)
		activeTripsMutex.Unlock()

		c.JSON(http.StatusAccepted, gin.H{"response": "Successfully trip ended"})
		c.JSON(http.StatusAccepted, gin.H{"response": startEnd})

	}
}

func handleGetTripstates(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		var requestBody struct {
			Username string `json:"username"`
		}

		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is missing"})
			return
		}

		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		existingTrip, err := getTripData(db, requestBody.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to find the trip data"})
			return
		}

		if existingTrip == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "no trip data found"})
			return
		}

		var elapsedTime int64
		if existingTrip.TripStarted && existingTrip.OriginalTripStartTime != nil {
			elapsedTime = time.Since(*existingTrip.OriginalTripStartTime).Milliseconds()
		}

		response := struct {
			TripStarted           bool      `json:"tripStarted"`
			TripStartTime         time.Time `json:"tripStartTime"`
			OriginalTripStartTime time.Time `json:"originalTripStartTime"`
			ElapsedTime           int64     `json:"elapsedTime"`
		}{
			TripStarted:           existingTrip.TripStarted,
			TripStartTime:         *existingTrip.TripStartTime,
			OriginalTripStartTime: *existingTrip.OriginalTripStartTime,
			ElapsedTime:           elapsedTime,
		}

		c.JSON(http.StatusAccepted, gin.H{"response": response})
		c.JSON(http.StatusAccepted, gin.H{"response": "Successfully fetched the trip states"})

	}
}

func upsertTripData(db *sql.DB, startEnd StartEnd) error {
	query := `
        INSERT INTO trip (username, trip_started, trip_start_time, trip_end_time, original_trip_start_time)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username)
        DO UPDATE SET trip_started = EXCLUDED.trip_started, trip_start_time = EXCLUDED.trip_start_time, trip_end_time = EXCLUDED.trip_end_time, original_trip_start_time = EXCLUDED.original_trip_start_time
    `

	_, err := db.Exec(query, startEnd.Username, startEnd.TripStarted, startEnd.TripStartTime, startEnd.TripEndTime, startEnd.OriginalTripStartTime)
	if err != nil {
		return fmt.Errorf("failed to insert or update trip data: %w", err)
	}

	return nil
}

func handleStartTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		var requestBody struct {
			Username string `json:"username"`
		}
		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			http.Error(w, "Failed to parse request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		username := requestBody.Username
		if username == "" {
			http.Error(w, "Username is missing in request body", http.StatusBadRequest)
			return
		}

		existingTrip, err := getTripData(db, username)
		if err != nil {
			http.Error(w, "Failed to retrieve trip data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if existingTrip != nil && existingTrip.TripStarted {
			// Trip is already started
			w.WriteHeader(http.StatusConflict)
			w.Write([]byte("Trip is already started"))
			return
		}

		tripStartTime := time.Now()
		var originalTripStartTime time.Time
		if existingTrip != nil && existingTrip.OriginalTripStartTime != nil {
			originalTripStartTime = *existingTrip.OriginalTripStartTime
		} else {
			originalTripStartTime = tripStartTime
		}

		startEnd := StartEnd{
			Username:              username,
			TripStarted:           true,
			TripStartTime:         &tripStartTime,
			TripEndTime:           nil,
			OriginalTripStartTime: &originalTripStartTime,
		}

		err = upsertTripData(db, startEnd)
		if err != nil {
			http.Error(w, "Failed to insert or update trip data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Trip started successfully"))
	}
}

func getActiveTrips(db *sql.DB) ([]StartEnd, error) {
	query := "SELECT username, trip_started, trip_start_time, trip_end_time FROM trip WHERE trip_started = true"
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query active trips: %w", err)
	}
	defer rows.Close()

	var trips []StartEnd
	for rows.Next() {
		var trip StartEnd
		if err := rows.Scan(&trip.Username, &trip.TripStarted, &trip.TripStartTime, &trip.TripEndTime); err != nil {
			return nil, fmt.Errorf("failed to scan trip data: %w", err)
		}
		trips = append(trips, trip)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %w", err)
	}

	return trips, nil
}

var (
	activeTripsMutex sync.Mutex
	activeTrips      = make(map[string]*time.Time)
)

func handleEndTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		var requestBody struct {
			Username string `json:"username"`
		}
		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			http.Error(w, "Failed to parse request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		username := requestBody.Username
		if username == "" {
			http.Error(w, "Username is missing in request body", http.StatusBadRequest)
			return
		}

		existingTrip, err := getTripData(db, username)
		if err != nil {
			http.Error(w, "Failed to retrieve trip data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if existingTrip == nil || !existingTrip.TripStarted {
			http.Error(w, "No trip in progress", http.StatusConflict)
			return
		}

		tripEndTime := time.Now()

		startEnd := StartEnd{
			Username:              username,
			TripStarted:           false,
			TripStartTime:         existingTrip.TripStartTime,
			TripEndTime:           &tripEndTime,
			OriginalTripStartTime: existingTrip.OriginalTripStartTime,
		}

		err = upsertTripData(db, startEnd)
		if err != nil {
			http.Error(w, "Failed to update trip data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		activeTripsMutex.Lock()
		delete(activeTrips, username)
		activeTripsMutex.Unlock()

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Trip ended successfully"))
	}
}

func handleGetTripState(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		var requestBody struct {
			Username string `json:"username"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			http.Error(w, "Failed to parse request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		username := requestBody.Username

		existingTrip, err := getTripData(db, username)
		if err != nil {
			http.Error(w, "Failed to retrieve trip data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if existingTrip == nil {
			http.Error(w, "No trip data found", http.StatusNotFound)
			return
		}

		var elapsedTime int64
		if existingTrip.TripStarted && existingTrip.OriginalTripStartTime != nil {
			elapsedTime = time.Since(*existingTrip.OriginalTripStartTime).Milliseconds()
		}

		response := struct {
			TripStarted           bool      `json:"tripStarted"`
			TripStartTime         time.Time `json:"tripStartTime"`
			OriginalTripStartTime time.Time `json:"originalTripStartTime"`
			ElapsedTime           int64     `json:"elapsedTime"`
		}{
			TripStarted:           existingTrip.TripStarted,
			TripStartTime:         *existingTrip.TripStartTime,
			OriginalTripStartTime: *existingTrip.OriginalTripStartTime,
			ElapsedTime:           elapsedTime,
		}

		responseBody, err := json.Marshal(response)
		if err != nil {
			http.Error(w, "Failed to marshal response: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write(responseBody)
	}
}

// uploadToMinIO uploads multiple objects to MinIO and returns their URLs.
func uploadToMinIO(minioClient *minio.Client, endpoint, bucketName string, objectNames []string, imageDatas [][]byte) ([]string, error) {
	var imageURLs []string

	// Ensure the bucket exists
	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		return nil, err
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return nil, err
		}
	}

	for i, data := range imageDatas {
		reader := bytes.NewReader(data)
		objectName := objectNames[i]
		contentType := "application/octet-stream" // Default content type

		// Determine content type based on the file extension
		if strings.HasSuffix(objectName, ".jpg") || strings.HasSuffix(objectName, ".jpeg") {
			contentType = "image/jpeg"
		} else if strings.HasSuffix(objectName, ".png") {
			contentType = "image/png"
		}

		_, err := minioClient.PutObject(ctx, bucketName, objectName, reader, int64(len(data)), minio.PutObjectOptions{
			ContentType: contentType,
		})
		if err != nil {
			return nil, err
		}
		imageURL := fmt.Sprintf("http://%s/%s/%s", endpoint, bucketName, objectName)
		imageURLs = append(imageURLs, imageURL)
	}

	return imageURLs, nil
}

func insertData(db *sql.DB, formData FormData) error {
	multipleImagesJSON, err := json.Marshal(formData.MultipleImages)
	if err != nil {
		return fmt.Errorf("failed to marshal image URLs to JSON: %v", err)
	}

	query := `
        INSERT INTO userform (location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, description, poleimage, availableisp, selectisp, multipleimages, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`

	_, err = db.Exec(query, formData.Location, formData.Latitude, formData.Longitude, formData.SelectPole, formData.SelectPoleStatus, formData.SelectPoleLocation, formData.Description, formData.PoleImage, formData.AvailableISP, formData.SelectISP, string(multipleImagesJSON), time.Now())
	return err
}

func handleFormData(db *sql.DB, minioClient *minio.Client, bucketName string, endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var formData FormData
		err := r.ParseMultipartForm(10 << 20) // Parse multipart form data with a max of 10 MB
		if err != nil {
			log.Printf("Error parsing multipart form: %v", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Retrieve form fields
		formData.Location = r.FormValue("location")
		formData.Latitude, _ = strconv.ParseFloat(r.FormValue("latitude"), 64)
		formData.Longitude, _ = strconv.ParseFloat(r.FormValue("longitude"), 64)
		formData.SelectPole = r.FormValue("selectpole")
		formData.SelectPoleStatus = r.FormValue("selectpolestatus")
		formData.SelectPoleLocation = r.FormValue("selectpolelocation")
		formData.Description = r.FormValue("description")
		formData.AvailableISP = r.FormValue("availableisp")
		formData.SelectISP = r.FormValue("selectisp")

		// Retrieve and upload single image
		file, _, err := r.FormFile("poleimage")
		if err != nil {
			log.Printf("Error retrieving single image: %v", err)
		} else {
			poleImageData, err := io.ReadAll(file)
			file.Close()
			if err != nil {
				log.Printf("Error reading single image: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			poleImageName := fmt.Sprintf("%d-poleimage.jpeg", time.Now().UnixNano())
			poleImageURLs, err := uploadToMinIO(minioClient, endpoint, bucketName, []string{poleImageName}, [][]byte{poleImageData})
			if err != nil {
				log.Printf("Error uploading single image to MinIO: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			formData.PoleImage = poleImageURLs[0] // Update poleImageURL to be a string
			log.Println("Uploaded Pole Image:", poleImageURLs[0])
		}

		// Retrieve and upload multiple images
		multipleImages := r.MultipartForm.File["multipleimages"]
		var multipleImageURLs []string
		for i, fileHeader := range multipleImages {
			file, err := fileHeader.Open()
			if err != nil {
				log.Printf("Error opening multiple image %d: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			imageData, err := io.ReadAll(file)
			file.Close()
			if err != nil {
				log.Printf("Error reading the multiple image %d: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			objectName := fmt.Sprintf("%d-multipleimage-%d.jpeg", time.Now().UnixNano(), i)
			imageURLs, err := uploadToMinIO(minioClient, endpoint, bucketName, []string{objectName}, [][]byte{imageData})
			if err != nil {
				log.Printf("Error uploading multiple image %d to MinIO: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			multipleImageURLs = append(multipleImageURLs, imageURLs...)
		}
		formData.MultipleImages = multipleImageURLs
		log.Println("Uploaded multiple images:", multipleImageURLs)

		// Insert form data into the database
		if db != nil {
			if err := insertData(db, formData); err != nil {
				log.Printf("Error inserting data into database: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Data inserted successfully"))
	}
}

func handleUserData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Fetching user data...")
		rows, err := db.Query("SELECT id, location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, description, poleimage, availableisp, selectisp, multipleimages, created_at FROM userform")
		if err != nil {
			log.Printf("Error querying database: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []FormData
		for rows.Next() {
			var formData FormData
			var multipleImagesJSON sql.NullString // Use sql.NullString to handle NULL values

			// Scan row values into variables
			err := rows.Scan(&formData.ID, &formData.Location, &formData.Latitude, &formData.Longitude, &formData.SelectPole, &formData.SelectPoleStatus, &formData.SelectPoleLocation, &formData.Description, &formData.PoleImage, &formData.AvailableISP, &formData.SelectISP, &multipleImagesJSON, &formData.CreatedAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			// Check if JSON data is empty or NULL
			if multipleImagesJSON.Valid && multipleImagesJSON.String != "" {
				// Convert the JSON string back to a slice of strings only if it's not empty
				if err := json.Unmarshal([]byte(multipleImagesJSON.String), &formData.MultipleImages); err != nil {
					log.Printf("Error unmarshalling JSON: %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
			}

			// Append form data to the slice
			data = append(data, formData)
		}

		if err := rows.Err(); err != nil {
			log.Printf("Row error: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// Set response header and encode data as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}

func handleTotalDistances(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := `SELECT id, latitude, longitude, created_at::date AS date
		          FROM userform
		          WHERE created_at >= Now() - INTERVAL '7 days'
		          ORDER BY date`

		rows, err := db.Query(query)
		if err != nil {
			log.Printf("Error while querying the data: %v", err)
			http.Error(w, "Error while querying the data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		type DailyDistance struct {
			Date     string   `json:"date"`
			Distance *float64 `json:"distance"`
		}

		dailyDistances := make(map[string]float64)
		var previousData *GPSData

		for rows.Next() {
			var gpsData GPSData
			err := rows.Scan(&gpsData.ID, &gpsData.Latitude, &gpsData.Longitude, &gpsData.Date)
			if err != nil {
				log.Printf("Error scanning rows: %v", err)
				http.Error(w, "Error scanning rows", http.StatusInternalServerError)
				return
			}

			dateStr := gpsData.Date.Format("2006-01-02")
			if previousData != nil && previousData.Date.Format("2006-01-02") == dateStr {
				dailyDistances[dateStr] += calculateDistance(previousData.Latitude, previousData.Longitude, gpsData.Latitude, gpsData.Longitude)
			}
			previousData = &gpsData
		}

		if err := rows.Err(); err != nil {
			log.Printf("Error iterating over rows: %v", err)
			http.Error(w, "Error iterating over rows", http.StatusInternalServerError)
			return
		}

		// Prepare the response for the last 7 days
		response := make([]DailyDistance, 7)
		for i := 0; i < 7; i++ {
			date := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
			if distance, found := dailyDistances[date]; found {
				response[6-i] = DailyDistance{Date: date, Distance: &distance}
			} else {
				response[6-i] = DailyDistance{Date: date, Distance: nil}
			}
		}

		// Convert the response to JSON
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			log.Printf("Error marshalling JSON: %v", err)
			http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
			return
		}

		// Set content-type header and write response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResponse)
	}
}

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const EarthRadius = 6371 // Earth's radius in kilometers

	// Convert latitude and longitude from degrees to radians
	lat1 = lat1 * math.Pi / 180
	lat2 = lat2 * math.Pi / 180
	lon1 = lon1 * math.Pi / 180
	lon2 = lon2 * math.Pi / 180

	// Haversine formula
	deltaLat := lat2 - lat1
	deltaLon := lon2 - lon1

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1)*math.Cos(lat2)*math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return EarthRadius * c
}

func handleGetFormData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, description, poleimage, availableisp, selectisp, multipleimages, created_at FROM userform")
		if err != nil {
			log.Printf("Error querying database: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []FormData
		for rows.Next() {
			var formData FormData
			var multipleImagesJSON sql.NullString // Use sql.NullString to handle NULL values
			// Scan row values into variables
			err := rows.Scan(&formData.ID, &formData.Location, &formData.Latitude, &formData.Longitude, &formData.SelectPole, &formData.SelectPoleStatus, &formData.SelectPoleLocation, &formData.Description, &formData.PoleImage, &formData.AvailableISP, &formData.SelectISP, &multipleImagesJSON, &formData.CreatedAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			// Check if JSON data is empty or NULL
			if multipleImagesJSON.Valid && multipleImagesJSON.String != "" {
				// Convert the JSON string back to a slice of strings only if it's not empty
				if err := json.Unmarshal([]byte(multipleImagesJSON.String), &formData.MultipleImages); err != nil {
					log.Printf("Error unmarshalling JSON: %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
			}
			// Append form data to the slice
			data = append(data, formData)
		}
		if err := rows.Err(); err != nil {
			log.Printf("Row error: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		// Set response header and encode data as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}

func isInvalidFloat(value float64) bool {
	return value != value // NaN check
}

// i Wanna fetch  the latest image save in the database and I wanna to display it in the frontend ///// handleUserPoleImage handles the retrieval of the latest pole image and multiple images from the database
func handleUserPoleImage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Query to select the latest pole image URL and multiple images URLs from the database
		query := `SELECT poleimage, multipleimages FROM userform`
		row := db.QueryRow(query)

		var poleImage string
		var multipleImagesJSON sql.NullString // Use sql.NullString to handle NULL values

		// Scan the result into poleImage and multipleImagesJSON variables
		err := row.Scan(&poleImage, &multipleImagesJSON)
		if err != nil {
			if err == sql.ErrNoRows {
				// Handle case where no rows are returned
				log.Printf("No rows found: %v", err)
				http.Error(w, "No images found", http.StatusNotFound)
				return
			}
			log.Printf("Error querying the database: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Prepare response data
		response := map[string]interface{}{
			"poleImage": poleImage,
		}

		// Handle multiple images if the JSON string is valid
		if multipleImagesJSON.Valid && multipleImagesJSON.String != "" {
			var multipleImages []string
			if err := json.Unmarshal([]byte(multipleImagesJSON.String), &multipleImages); err != nil {
				log.Printf("Error unmarshalling JSON: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			response["multipleImages"] = multipleImages
		} else {
			response["multipleImages"] = []string{}
		}

		// Send the image URLs to the frontend
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

func handleDeleteData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.URL.Path[len("/api/data/"):]
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		query := "DELETE FROM userform WHERE id = $1"
		_, err = db.Exec(query, id)
		if err != nil {
			log.Printf("Error deleting data: %v", err)
			http.Error(w, "Failed to delete data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Data deleted successfully"))
	}
}

func handlegetGpsData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, latitude, longitude FROM userform")
		if err != nil {
			log.Printf("Error querying gps_data: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var gpsData []map[string]interface{}

		for rows.Next() {
			var id int
			var latitude, longitude float64
			if err := rows.Scan(&id, &latitude, &longitude); err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			data := map[string]interface{}{
				"id":        id,
				"latitude":  latitude,
				"longitude": longitude,
			}
			gpsData = append(gpsData, data)
		}

		if err := rows.Err(); err != nil {
			log.Printf("Row error: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(gpsData); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
func connectDB(cfg config) (*sql.DB, error) {
	// Additional debug statement for DSN
	fmt.Println("Connecting to database with DSN:", cfg.db.dsn)
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func main() {
	// Initialize MinIO client
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL := os.Getenv("MINIO_SSL") == "true"

	// Debugging statements to verify environment variables
	fmt.Println("MINIO_ENDPOINT:", endpoint)
	fmt.Println("MINIO_ACCESS_KEY:", accessKeyID)
	fmt.Println("MINIO_SECRET_KEY:", secretAccessKey)
	fmt.Println("MINIO_SSL:", useSSL)

	if endpoint == "" {
		log.Fatalln("MINIO_ENDPOINT is not set or empty")
	}

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalln("Failed to initialize MinIO client:", err)
	}

	// Configuration for database connection
	var cfg config
	flag.StringVar(&cfg.db.dsn, "dsn", "", "Postgres connection string")
	flag.StringVar(&cfg.jwt.secretKey, "jwt-secret", "your-secret-key", "JWT Secret Key")
	flag.DurationVar(&cfg.jwt.accessTokenTTL, "access-token-ttl", 15*time.Minute, "Access Token TTL")
	flag.DurationVar(&cfg.jwt.refreshTokenTTL, "refresh-token-ttl", 7*24*time.Hour, "Refresh Token TTL")
	flag.Parse()

	if cfg.db.dsn == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")

		// Debugging statements to verify database environment variables
		fmt.Println("DB_HOST:", host)
		fmt.Println("DB_PORT:", port)
		fmt.Println("DB_USER:", user)
		fmt.Println("DB_PASSWORD:", password)
		fmt.Println("DB_NAME:", dbname)

		cfg.db.dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	}

	// Connect to the database
	db, err := connectDB(cfg)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()

	// Set up HTTP handlers with required parameters
	bucketName := "location-tracker"
	http.HandleFunc("/submit-form", handleFormData(db, minioClient, bucketName, endpoint))
	http.HandleFunc("/user-data", handleUserData(db))
	http.HandleFunc("/api/data/", handleDeleteData(db))
	http.HandleFunc("/api/gps-data", handlegetGpsData(db))
	http.HandleFunc("/api/pole-image", handleUserPoleImage(db))
	http.HandleFunc("/ws", handleWebSocketConnections)
	http.HandleFunc("/start_trip", handleStartTrip(db))
	http.HandleFunc("/end_trip", handleEndTrip(db))
	http.HandleFunc("/get_trip_state", handleGetTripState(db))
	http.HandleFunc("/total-distances", handleTotalDistances(db))
	http.HandleFunc("/sign-up", handleUserSignup(db))
	http.HandleFunc("/login", handleUserLogin(db, cfg))
	http.HandleFunc("/refresh-token", handleRefreshToken(cfg))
	http.HandleFunc("/password-changer", handlePasswordChanger(db, cfg))

	// CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	handler := corsMiddleware(http.DefaultServeMux)

	// Start the server
	fmt.Println("Server is running on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Error starting server:", err)
	}
}
