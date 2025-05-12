package mq

import (
	"database/sql"
	"encoding/json"
	"log"

	"github.com/go-stomp/stomp"
)

type CartMessage struct {
	Event      string  `json:"event"`
	StudentID  string  `json:"studentId"`
	CourseID   string  `json:"courseId"`
	CourseName string  `json:"courseName"`
	Price      float64 `json:"price"`
}

func PublishCartEvent(db *sql.DB, msg CartMessage) error {
	conn, err := stomp.Dial("tcp", "localhost:61613", stomp.ConnOpt.HeartBeat(0, 0))
	if err != nil {
		return err
	}
	defer conn.Disconnect()

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = conn.Send(
		"/queue/cart.queue",
		"application/json",
		data,
		stomp.SendOpt.Receipt,
		stomp.SendOpt.Header("persistent", "true"),
	)
	if err != nil {
		log.Println("Failed to publish cart event:", err)
		return err
	}

	log.Printf("Published cart event: %s %s (%s)", msg.Event, msg.CourseName, msg.StudentID)
	return nil
}
