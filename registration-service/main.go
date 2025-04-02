package main

import (
	"context"
	"fmt"
	"log"

	"registration-service/prisma/db" // Replace with your actual module name
)

func main() {
	ctx := context.Background()
	client := db.NewClient()

	// Connect to the database
	if err := client.Prisma.Connect(); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer client.Prisma.Disconnect()

	// Test Prisma Query: Fetch all registrations
	registrations, err := client.Registration.FindMany().Exec(ctx)
	if err != nil {
		log.Fatalf("❌ Error fetching registrations: %v", err)
	}

	fmt.Println("✅ Successfully retrieved registrations:")
	for _, reg := range registrations {
		fmt.Printf("📌 Registration ID: %s | Student ID: %s | Course ID: %s\n", reg.ID, reg.StudentID, reg.CourseID)
	}
}
