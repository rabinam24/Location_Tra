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
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go"
)

type config struct {
	db struct {
		dsn string
	}
}
type AdditionalInfo struct {
	SelectISP      string   `json:"selectisp"`
	MultipleImages []string `json:"multipleimages"`
}

type FormData struct {
	ID                 int            `json:"id"`
	Location           string         `json:"location"`
	Latitude           float64        `json:"latitude"`
	Longitude          float64        `json:"longitude"`
	SelectPole         string         `json:"selectpole"`
	SelectPoleStatus   string         `json:"selectpolestatus"`
	SelectPoleLocation string         `json:"selectpolelocation"`
	Description        string         `json:"description"`
	PoleImage          string         `json:"poleimage_url"`
	AvailableISP       string         `json:"availableisp"`
	SelectISP          string         `json:"selectisp"`
	MultipleImages     []string       `json:"multipleimages_urls"`
	AdditionalInfo     AdditionalInfo `json:"additional_info"`
	CreatedAt          time.Time      `json:"created_at"`
}
type StartEnd struct {
	UserID        int       `json:"userid"`
	TripStarted   bool      `json:"trip_started"`
	TripStartTime time.Time `json:"-"`
	TripEndTime   time.Time `json:"-"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
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

func handleStartTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the request body to get the user ID
		var requestBody struct {
			UserID int `json:"userid"`
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		userID := requestBody.UserID

		// Get the current time as the trip start time
		tripStartTime := time.Now()

		// Assuming you have the user ID, create a StartEnd struct
		// with the appropriate data and call insertTripData to insert it into the database
		startEnd := StartEnd{
			UserID:        userID,
			TripStarted:   true,
			TripStartTime: tripStartTime,
			TripEndTime:   time.Time{}, // Trip end time is empty initially
		}

		// Insert trip data into the database
		err = insertTripData(db, startEnd)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Send a response indicating that the trip has started
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Trip started successfully"))
	}
}
func handleEndTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the request body to get the user ID
		var requestBody struct {
			UserID int `json:"userid"`
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		userID := requestBody.UserID

		// Check if trip start time exists in local storage
		tripStartTimeStr := r.Header.Get("X-Trip-Start-Time")
		var tripStartTime time.Time
		if tripStartTimeStr != "" {
			// Trip start time found in local storage, parse it
			tripStartTimeUnix, err := strconv.ParseInt(tripStartTimeStr, 10, 64)
			if err != nil {
				http.Error(w, "Invalid trip start time format", http.StatusBadRequest)
				return
			}
			tripStartTime = time.Unix(tripStartTimeUnix, 0)
		} else {
			// Trip start time not found in local storage, use current time
			tripStartTime = time.Now()
		}

		// Assuming you have the user ID, create a StartEnd struct
		// with the appropriate data and call insertTripData to insert it into the database
		startEnd := StartEnd{
			UserID:        userID,
			TripStarted:   false,
			TripStartTime: tripStartTime,
			TripEndTime:   time.Now(),
		}

		// Insert trip data into the database
		err = insertTripData(db, startEnd)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Send a response indicating that the trip has ended
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Trip ended successfully"))
	}
}

func insertTripData(db *sql.DB, startEnd StartEnd) error {
	query := `INSERT INTO trip (userid, trip_started, trip_start_time, trip_end_time) VALUES ($1, $2, $3, $4)`
	_, err := db.Exec(query, startEnd.UserID, startEnd.TripStarted, startEnd.TripStartTime, startEnd.TripEndTime)
	if err != nil {
		return err
	}
	return nil
}

func uploadToMinIO(minioClient *minio.Client, endpoint, bucketName string, objectNames []string, imageDatas [][]byte) ([]string, error) {
	var imageURLs []string

	for i, data := range imageDatas {
		reader := bytes.NewReader(data)
		_, err := minioClient.PutObject(bucketName, objectNames[i], reader, int64(len(data)), minio.PutObjectOptions{
			ContentType: "image/jpeg",
		})
		if err != nil {
			return nil, err
		}
		imageURL := fmt.Sprintf("http://%s/%s/%s", endpoint, bucketName, objectNames[i])
		imageURLs = append(imageURLs, imageURL)
	}

	return imageURLs, nil
}

// Insert form data into the userform table
func insertData(tx *sql.Tx, formData FormData, additionalInfo *AdditionalInfo) (int64, error) {
	// Marshal the MultipleImages slice into JSON
	multipleImagesJSON, err := json.Marshal(formData.MultipleImages)
	if err != nil {
		return 0, err
	}

	// Marshal the AdditionalInfo struct into JSON, handle the case when additionalInfo is nil
	var additionalInfoJSON []byte
	if additionalInfo != nil {
		additionalInfoJSON, err = json.Marshal(additionalInfo)
		if err != nil {
			return 0, err
		}
	}

	// Insert form data into the database
	query := `INSERT INTO userform (
		location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, 
		description, availableisp, poleimage, selectisp, multipleimages, additionalinfo,created_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13) RETURNING id`

	var id int64
	if additionalInfoJSON != nil {
		err = tx.QueryRow(query,
			formData.Location, formData.Latitude, formData.Longitude,
			formData.SelectPole, formData.SelectPoleStatus, formData.SelectPoleLocation,
			formData.Description, formData.AvailableISP, formData.PoleImage,
			formData.SelectISP, string(multipleImagesJSON), string(additionalInfoJSON),
		).Scan(&id)
	} else {
		err = tx.QueryRow(query,
			formData.Location, formData.Latitude, formData.Longitude,
			formData.SelectPole, formData.SelectPoleStatus, formData.SelectPoleLocation,
			formData.Description, formData.AvailableISP, formData.PoleImage,
			formData.SelectISP, string(multipleImagesJSON), nil,
		).Scan(&id)
	}

	if err != nil {
		return 0, err
	}

	return id, nil
}

// Handle form data
func handleFormData(db *sql.DB, minioClient *minio.Client, bucketName string, endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20) // 10 MB limit
		if err != nil {
			log.Printf("Error parsing multipart form: %v", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Retrieve form fields and files
		location := r.FormValue("location")
		latitude, _ := strconv.ParseFloat(r.FormValue("latitude"), 64)
		longitude, _ := strconv.ParseFloat(r.FormValue("longitude"), 64)
		selectPole := r.FormValue("selectpole")
		selectPoleStatus := r.FormValue("selectpolestatus")
		selectPoleLocation := r.FormValue("selectpolelocation")
		description := r.FormValue("description")
		availableISP := r.FormValue("availableisp")
		selectISP := r.FormValue("selectisp")

		// Handle pole image upload
		poleImageFile, _, err := r.FormFile("poleimage")
		if err != nil && err != http.ErrMissingFile {
			log.Printf("Error getting file poleimage: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var poleImageURL string
		if poleImageFile != nil {
			defer poleImageFile.Close()

			imageData, err := io.ReadAll(poleImageFile)
			if err != nil {
				log.Printf("Error reading pole image: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			objectName := fmt.Sprintf("%d-poleimage", time.Now().UnixNano())
			imageURLs, err := uploadToMinIO(minioClient, endpoint, bucketName, []string{objectName}, [][]byte{imageData})
			if err != nil {
				log.Printf("Error uploading pole image to MinIO: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			poleImageURL = imageURLs[0]
		}

		// Handle multiple image uploads
		multipleImageFiles := r.MultipartForm.File["multipleimages"]
		multipleImageURLs := make([]string, 0)

		for _, fileHeader := range multipleImageFiles {
			file, err := fileHeader.Open()
			if err != nil {
				log.Printf("Error opening file %s: %v", fileHeader.Filename, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer file.Close()

			imageData, err := io.ReadAll(file)
			if err != nil {
				log.Printf("Error reading file %s: %v", fileHeader.Filename, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			objectName := fmt.Sprintf("%d-%s", time.Now().UnixNano(), fileHeader.Filename)
			imageURLs, err := uploadToMinIO(minioClient, endpoint, bucketName, []string{objectName}, [][]byte{imageData})
			if err != nil {
				log.Printf("Error uploading file %s to MinIO: %v", fileHeader.Filename, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			multipleImageURLs = append(multipleImageURLs, imageURLs...)
		}

		formData := FormData{
			Location:           location,
			Latitude:           latitude,
			Longitude:          longitude,
			SelectPole:         selectPole,
			SelectPoleStatus:   selectPoleStatus,
			SelectPoleLocation: selectPoleLocation,
			Description:        description,
			AvailableISP:       availableISP,
			SelectISP:          selectISP,
			MultipleImages:     multipleImageURLs,
			PoleImage:          poleImageURL,
		}

		// Optional: AdditionalInfo struct
		var additionalInfo *AdditionalInfo

		// Insert form data into the database
		tx, err := db.Begin()
		if err != nil {
			log.Printf("Error beginning transaction: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = insertData(tx, formData, additionalInfo)
		if err != nil {
			tx.Rollback()
			log.Printf("Error inserting data: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := tx.Commit(); err != nil {
			log.Printf("Error committing transaction: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
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

// i Wanna fetch  the latest image save in the database and I wanna to display it in the frontend ///
func handleUserPoleImage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Query to select the latest pole image URL and multiple images URLs from the database
		query := `SELECT poleimage, multipleimages FROM userform ORDER BY created_at DESC LIMIT 1`
		row := db.QueryRow(query)

		var poleImage string
		var multipleImagesJSON sql.NullString // Use sql.NullString to handle NULL values

		// Scan the result into variables
		err := row.Scan(&poleImage, &multipleImagesJSON)
		if err != nil {
			if err == sql.ErrNoRows {
				// Handle case where no rows are returned
				log.Printf("No rows found: %v", err)
				http.Error(w, "No images found", http.StatusNotFound)
				return
			}
			// Log and handle other errors
			log.Printf("Error querying the database: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// Prepare response data
		response := map[string]interface{}{
			"poleImage": poleImage,
		}

		// Handle multiple images JSON
		if multipleImagesJSON.Valid && multipleImagesJSON.String != "" {
			var multipleImages []string
			// Unmarshal JSON string to slice of strings
			if err := json.Unmarshal([]byte(multipleImagesJSON.String), &multipleImages); err != nil {
				log.Printf("Error unmarshalling JSON: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			response["multipleImages"] = multipleImages
		} else {
			response["multipleImages"] = []string{}
		}

		// Set response header and encode data as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
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
		rows, err := db.Query("SELECT id, latitude, longitude FROM gps_data")
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
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func main() {
	// Initialize MinIO client
	endpoint := "172.17.0.1:9000"

	accessKeyID := "JJiBrYDyIGUpRlXpTl00"
	secretAccessKey := "lqD6aBXF5C793HQgOtZuQKlUwB5R5Z95FcLQFmU4"
	useSSL := false

	client, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)
	if err != nil {
		log.Fatalln("Failed to initialize MinIO client:", err)
	}

	// Configuration for database connection
	var cfg config
	flag.StringVar(&cfg.db.dsn, "dsn", "", "Postgres connection string")
	flag.Parse()

	if cfg.db.dsn == "" {
		host := "localhost"
		port := 5432
		user := "binam"
		password := "Bhandari"
		dbname := "binam"
		cfg.db.dsn = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	}

	// Connect to the database
	db, err := connectDB(cfg)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()

	// Set up HTTP handlers with required parameters
	bucketName := "location-tracker"
	http.HandleFunc("/submit-form", handleFormData(db, client, bucketName, endpoint))
	http.HandleFunc("/user-data", handleUserData(db))
	http.HandleFunc("/api/data/", handleDeleteData(db))
	http.HandleFunc("/api/gps-data", handlegetGpsData(db))
	http.HandleFunc("/api/pole-image", handleUserPoleImage(db))
	http.HandleFunc("/ws", handleWebSocketConnections)
	http.HandleFunc("/start-trip", handleStartTrip(db))
	http.HandleFunc("/end-trip", handleEndTrip(db))
	http.HandleFunc("/get-form-data", handleGetFormData(db))

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
