package mq

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"

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
	// Get STOMP broker address from environment variable
	brokerAddr := os.Getenv("STOMP_BROKER_ADDR")
	if brokerAddr == "" {
		brokerAddr = "localhost:61613" // Default to localhost if not set
	}

	conn, err := stomp.Dial("tcp", brokerAddr, stomp.ConnOpt.HeartBeat(0, 0))
	if err != nil {
		log.Printf("Failed to connect to STOMP broker at %s: %v", brokerAddr, err)
		return err
	}
	defer conn.Disconnect()

	data, err := json.Marshal(msg)
	if err != nil {
		log.Println("Failed to marshal cart message:", err)
		return err
	}

	err = conn.Send(
		"/queue/cart_events",
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
