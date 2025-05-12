package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"example.com/Course-Service/v2/mq"
)

func AddToCartHandler(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	log.Println("Hit /cart/add") // This should show in your terminal now

	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type reqBody struct {
		StudentID  string  `json:"studentId"`
		CourseID   string  `json:"courseId"`
		CourseName string  `json:"courseName"`
		Price      float64 `json:"price"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		log.Println("Invalid JSON:", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	log.Printf("Received AddToCart: %+v\n", body)

	err := mq.PublishCartEvent(db, mq.CartMessage{
		Event:      "add.cart",
		StudentID:  body.StudentID,
		CourseID:   "COURSE-" + body.CourseID,
		CourseName: body.CourseName,
		Price:      body.Price,
	})
	if err != nil {
		http.Error(w, "failed to publish event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
