package main

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

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

const (
	host     = "localhost"
	port     = 5432
	user     = "binam"
	password = "Bhandari"
	dbname   = "binam"
)

func insertData(db *sql.DB, formData FormData) error {
	query := `
        INSERT INTO userform (location, latitude, longitude, selectpole, selectpolestatus, selectpolelocation, description, poleimage, availableisp, selectisp, multipleimages, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`

	_, err := db.Exec(query, formData.Location, formData.Latitude, formData.Longitude, formData.SelectPole, formData.SelectPoleStatus, formData.SelectPoleLocation, formData.Description, formData.PoleImage, formData.AvailableISP, formData.SelectISP, formData.MultipleImages, time.Now())
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
			poleImageData, err := ioutil.ReadAll(file)
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
			imageData, err := ioutil.ReadAll(file)
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
			data = append(data, formData)
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
		rows, err := db.Query("SELECT id, latitude, longitude FROM userform")
		if err != nil {
			log.Printf("Error querying database: %v", err)
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
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/submit-form", handleFormData(db))
	http.HandleFunc("/user-data", handleUserData(db))
	http.HandleFunc("/api/data/", handleDeleteData(db))
	http.HandleFunc("/api/gps-data", handlegetGpsData(db))
	http.HandleFunc("/api/pole-image", handleUserPoleImage(db))
	// http.HandleFunc("/ws", handleWebSocketConnections)

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
	// go handleMessages(db)

	fmt.Println("Server is running on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
