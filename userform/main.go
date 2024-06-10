package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/base64"
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

//	func uploadToMinIO(client *minio.Client, bucketName, objectName string, fileData []byte) (string, error) {
//		_, err := client.PutObject(
//			bucketName,
//			objectName,
//			bytes.NewReader(fileData),
//			int64(len(fileData)),
//			minio.PutObjectOptions{ContentType: "application/octet-stream"},
//		)
//		if err != nil {
//			return "", err
//		}
//		// Manually construct the URL using the endpoint, bucket name, and object name
//		fileURL := fmt.Sprintf("http://%s/%s/%s", "play.min.io", bucketName, objectName)
//		return fileURL, nil
//	}
func uploadToMinIO(minioClient *minio.Client, endpoint, bucketName, objectName string, data []byte) (string, error) {
	reader := bytes.NewReader(data)
	_, err := minioClient.PutObject(bucketName, objectName, reader, int64(reader.Len()), minio.PutObjectOptions{
		ContentType: "image/jpeg",
	})
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("http://%s/%s/%s", endpoint, bucketName, objectName), nil
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

		log.Println("MultipartForm:", r.MultipartForm)

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

		// Log received form fields
		log.Println("Form Data:", formData)

		// Retrieve and upload single image
		file, _, err := r.FormFile("image")
		if err != nil {
			log.Printf("Error retrieving single image: %v", err)
		} else {
			defer file.Close()
			poleImageData, err := io.ReadAll(file)
			if err != nil {
				log.Printf("Error reading single image: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			poleImageName := fmt.Sprintf("%d-poleimage.jpeg", time.Now().UnixNano())
			poleImageURL, err := uploadToMinIO(minioClient, endpoint, bucketName, poleImageName, poleImageData)
			if err != nil {
				log.Printf("Error uploading single image to MinIO: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			formData.PoleImage = poleImageURL
			log.Println("Uploaded Pole Image:", poleImageURL)
		}

		// Retrieve and upload multiple images
		multipleImages := r.MultipartForm.File["multipleimages"]
		for i, fileHeader := range multipleImages {
			file, err := fileHeader.Open()
			if err != nil {
				log.Printf("Error opening multiple image %d: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer file.Close()
			imageData, err := io.ReadAll(file)
			if err != nil {
				log.Printf("Error reading multiple image %d: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			objectName := fmt.Sprintf("%d-multipleimage-%d.jpeg", time.Now().UnixNano(), i)
			imageURL, err := uploadToMinIO(minioClient, endpoint, bucketName, objectName, imageData)
			if err != nil {
				log.Printf("Error uploading multiple image %d to MinIO: %v", i, err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			formData.MultipleImages = append(formData.MultipleImages, imageURL)
			log.Println("Uploaded Multiple Image:", imageURL)
		}

		// Insert form data into the database (if applicable)
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

func isInvalidFloat(value float64) bool {
	return value != value // NaN check
}

// i Wanna fetch  the latest image save in the database and I wanna to display it in the frontend ///
func handleUserPoleImage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Query to select the latest pole image from the database
		query := `SELECT poleimage FROM userform ORDER BY created_at DESC LIMIT 1`

		row := db.QueryRow(query)
		var imageData []byte
		err := row.Scan(&imageData)
		if err != nil {
			log.Printf("Error querying the database: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Convert image data to base64 encoding
		base64Image := base64.StdEncoding.EncodeToString(imageData)

		// Send the base64 encoded image to the frontend
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(base64Image); err != nil {
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