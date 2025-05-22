package mq

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"

	"github.com/go-stomp/stomp"
	"registration.mod/registration-v3/graph/model"
)

type EnrollmentMessage struct {
	StudentID string `json:"studentId"`
	CourseID  string `json:"courseId"`
	Status    string `json:"status"`
}

func StartEnrollmentConsumer(db *sql.DB, broadcast func(*model.Registration)) {
	conn, err := stomp.Dial("tcp", "localhost:61613", stomp.ConnOpt.HeartBeat(0, 0))
	if err != nil {
		log.Fatal("Failed to connect to ActiveMQ:", err)
	}
	log.Println("Connected to ActiveMQ for enrollment consumer")

	sub, err := conn.Subscribe("/queue/enrollment.queue", stomp.AckAuto)
	if err != nil {
		log.Fatal("Failed to subscribe to enrollment.queue:", err)
	}
	defer sub.Unsubscribe()

	for {
		msg := <-sub.C
		var payload EnrollmentMessage
		err := json.Unmarshal(msg.Body, &payload)
		if err != nil {
			log.Println("Failed to parse enrollment message:", err)
			continue
		}

		log.Printf("Received enrollment message: %+v\n", payload)

		_, err = db.ExecContext(context.Background(), `
			INSERT INTO registrations (student_id, course_id, status)
			VALUES ($1, $2, $3)
		`, payload.StudentID, payload.CourseID, payload.Status)

		if err != nil {
			log.Println("Failed to update registration status:", err)
		} else {
			log.Printf("Marked student %s as enrolled in course %s\n", payload.StudentID, payload.CourseID)

			// Fetch the new registration
			row := db.QueryRowContext(context.Background(), `
				SELECT id, student_id, course_id, status, enrolled_at, updated_at
				FROM registrations
				WHERE student_id = $1 AND course_id = $2
				ORDER BY enrolled_at DESC LIMIT 1
			`, payload.StudentID, payload.CourseID)

			var reg model.Registration
			var status string
			err = row.Scan(&reg.ID, &reg.StudentID, &reg.CourseID, &status, &reg.EnrolledAt, &reg.UpdatedAt)
			if err == nil {
				reg.Status = model.RegistrationStatus(status)
				broadcast(&reg) // Broadcast to all subscribers
			}
		}
	}
}
