package main

import (
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
	PoleImage          []byte    `json:"poleimage"`
	AvailableISP       string    `json:"availableisp"`
	SelectISP          string    `json:"selectisp"`
	MultipleImages     []byte    `json:"multipleimages"`
	CreatedAt          time.Time `json:"created_at"`
}

type StartEnd struct {
	UserID        int       `json:"userid"`
	TripStarted   bool      `json:"trip_started"`
	TripStartTime time.Time `json:"-"`
	TripEndTime   time.Time `json:"-"`
}

const (
	host     = "localhost"
	port     = 5432
	user     = "binam"
	password = "Bhandari"
	dbname   = "binam"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocketConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading the web socket connection:", err)
		return
	}
	defer conn.Close()

	//Loop to handle incoming web Socket message
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading the message from the websocket:", err)
			break
		}
		fmt.Printf("Received message from the client: %s\n", message)

		// Echo message back to the client
		err = conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error writing the message to the  websocket:", err)
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

func insertData(db *sql.DB, formData FormData) error {
	query := `
        INSERT INTO userform (location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, description, poleimage, availableisp, selectisp, multipleimages, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`

	base64Image := base64.StdEncoding.EncodeToString(formData.PoleImage)

	_, err := db.Exec(query, formData.Location, formData.Latitude, formData.Longitude, formData.SelectPole, formData.SelectPoleStatus, formData.SelectPoleLocation, formData.Description, base64Image, formData.AvailableISP, formData.SelectISP, formData.MultipleImages, time.Now())
	return err
}

func handleFormData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var formData FormData
		err := r.ParseMultipartForm(10 << 20) // Parse multipart form data with a max of 10 MB
		if err != nil {
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

		// Retrieve and save single image
		file, _, err := r.FormFile("image")
		if err == nil {
			defer file.Close()
			poleImageData, err := io.ReadAll(file)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			formData.PoleImage = poleImageData
		}

		// Retrieve and save multiple images
		multipleImages := r.MultipartForm.File["multipleimages"]
		for _, fileHeader := range multipleImages {
			file, err := fileHeader.Open()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer file.Close()
			imageData, err := io.ReadAll(file)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// Append imageData as an element of formData.MultipleImages
			formData.MultipleImages = append(formData.MultipleImages, imageData...)
		}

		// Insert form data into the database
		if err := insertData(db, formData); err != nil {
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
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []FormData
		for rows.Next() {
			var formData FormData
			if err := rows.Scan(&formData.ID, &formData.Location, &formData.Latitude, &formData.Longitude, &formData.SelectPole, &formData.SelectPoleStatus, &formData.SelectPoleLocation, &formData.Description, &formData.PoleImage, &formData.AvailableISP, &formData.SelectISP, &formData.MultipleImages, &formData.CreatedAt); err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Check for NaN values
			if isInvalidFloat(formData.Latitude) || isInvalidFloat(formData.Longitude) {
				log.Printf("Invalid latitude or longitude for ID: %d", formData.ID)
				continue // Skip this entry
			}

			// Read image data from the database
			poleImageData := formData.PoleImage
			// You may need to read multiple images similarly if they are stored in the database

			// Set image data in the form data struct
			formData.PoleImage = nil // Clear the image data to avoid sending it in JSON response
			// You may need to clear multiple image fields similarly if they are present

			// Append form data to the slice
			data = append(data, formData)

			// Send image data in the response separately
			w.Header().Set("Content-Type", "image/jpeg") // Set appropriate content type
			w.Write(poleImageData)                       // Write the image data to the response writer
		}

		if err := rows.Err(); err != nil {
			log.Printf("Row error: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
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
	var cfg config
	flag.StringVar(&cfg.db.dsn, "dsn", "", "Postgres connection string")
	flag.Parse()

	if cfg.db.dsn == "" {
		cfg.db.dsn = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	}

	db, err := connectDB(cfg)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()

	http.HandleFunc("/submit-form", handleFormData(db))
	http.HandleFunc("/user-data", handleUserData(db))
	http.HandleFunc("/api/data/", handleDeleteData(db))
	http.HandleFunc("/api/gps-data", handlegetGpsData(db))
	http.HandleFunc("/api/pole-image", handleUserPoleImage(db))
	http.HandleFunc("/ws", handleWebSocketConnections)
	http.HandleFunc("/start-trip", handleStartTrip(db))
	http.HandleFunc("/end-trip", handleEndTrip(db))

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

	fmt.Println("Server is running on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Error starting server:", err)
	}
}
