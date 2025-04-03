package graph

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid" // Import the UUID package
	"registration.mod/registration-v3/graph/model"
)

type Resolver struct {
	DB *sql.DB
}

// Get a single registration by ID
func (r *queryResolver) Registration(ctx context.Context, id string) (*model.Registration, error) {
	row := r.Resolver.DB.QueryRow(`
		SELECT id, student_id, course_id, term, grade, status, enrolled_at, updated_at
		FROM registrations WHERE id = $1`, id)

	var registration model.Registration
	err := row.Scan(
		&registration.ID,
		&registration.StudentID,
		&registration.CourseID,
		&registration.Term,
		&registration.Grade,
		&registration.Status,
		&registration.EnrolledAt,
		&registration.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("registration not found: %v", err)
	}
	return &registration, nil
}

// Get all registrations
func (r *queryResolver) Registrations(ctx context.Context) ([]*model.Registration, error) {
	rows, err := r.Resolver.DB.Query(`
		SELECT id, student_id, course_id, term, grade, status, enrolled_at, updated_at 
		FROM registrations`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var registrations []*model.Registration
	for rows.Next() {
		var reg model.Registration
		if err := rows.Scan(
			&reg.ID,
			&reg.StudentID,
			&reg.CourseID,
			&reg.Term,
			&reg.Grade,
			&reg.Status,
			&reg.EnrolledAt,
			&reg.UpdatedAt,
		); err != nil {
			return nil, err
		}
		registrations = append(registrations, &reg)
	}
	return registrations, nil
}

// Create a new registration
func (r *mutationResolver) CreateRegistration(
	ctx context.Context,
	studentID string,
	courseID string,
	term string,
	grade *string, // Change grade to a pointer to string
	status string,
) (*model.Registration, error) {
	// Generate a new UUID
	id := uuid.New().String() // Generate valid UUID
	enrolledAt := time.Now().Format(time.RFC3339)
	updatedAt := enrolledAt

	_, err := r.Resolver.DB.Exec(`
        INSERT INTO registrations (id, student_id, course_id, term, grade, status, enrolled_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		id, studentID, courseID, term, grade, status, enrolledAt, updatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %v", err)
	}

	return &model.Registration{
		ID:         id,
		StudentID:  studentID,
		CourseID:   courseID,
		Term:       term,
		Grade:      *grade, // Dereference grade here
		Status:     status,
		EnrolledAt: enrolledAt,
		UpdatedAt:  updatedAt,
	}, nil
}

// Update an existing registration
func (r *mutationResolver) UpdateRegistration(
	ctx context.Context,
	id string,
	studentID string,
	courseID string,
	term string,
	grade *string, // Change grade to *string
	status string,
) (*model.Registration, error) {
	updatedAt := time.Now().Format(time.RFC3339)

	// Use the passed grade or leave it as NULL if it's not provided
	_, err := r.Resolver.DB.Exec(`
        UPDATE registrations 
        SET student_id=$1, course_id=$2, term=$3, grade=$4, status=$5, updated_at=$6 
        WHERE id=$7`,
		studentID, courseID, term, grade, status, updatedAt, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update registration: %v", err)
	}

	return &model.Registration{
		ID:         id,
		StudentID:  studentID,
		CourseID:   courseID,
		Term:       term,
		Grade:      *grade, // Dereference grade here
		Status:     status,
		EnrolledAt: time.Now().Format(time.RFC3339), // Keep original timestamp
		UpdatedAt:  updatedAt,
	}, nil
}

// Delete a registration
func (r *mutationResolver) DeleteRegistration(ctx context.Context, id string) (*bool, error) {
	_, err := r.Resolver.DB.Exec("DELETE FROM registrations WHERE id=$1", id)
	if err != nil {
		// Use a pointer to bool for the first return
		failure := false
		return &failure, fmt.Errorf("failed to delete registration: %v", err)
	}

	// Allocate memory for success as a pointer to bool
	success := new(bool)
	*success = true // Set the value to true
	return success, nil
}
