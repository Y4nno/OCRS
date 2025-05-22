package mq

import (
	"encoding/json"
	"log"

	"github.com/go-stomp/stomp"
)

type EnrollmentMessage struct {
	StudentID string `json:"studentId"`
	CourseID  string `json:"courseId"`
	Status    string `json:"status"`
}

func PublishEnrollment(message EnrollmentMessage) error {
	conn, err := stomp.Dial("tcp", "localhost:61613", stomp.ConnOpt.HeartBeat(0, 0))
	if err != nil {
		return err
	}
	defer conn.Disconnect()

	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	err = conn.Send(
		"/queue/enrollment.queue",
		"application/json",
		data,
		stomp.SendOpt.Receipt,
		stomp.SendOpt.Header("persistent", "true"), // in case you're saving it
	)
	if err != nil {
		log.Println("Failed to publish to enrollment.queue:", err)
		return err
	}

	log.Println("Published enrollment to queue for student", message.StudentID+"and course", message.CourseID)
	return nil
}
