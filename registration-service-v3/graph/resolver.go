package graph

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"registration.mod/registration-v3/graph/model"
)

type Resolver struct {
	DB *sql.DB
}

// === QUERY RESOLVERS ===

func (r *queryResolver) Registration(ctx context.Context, id string) (*model.Registration, error) {
	row := r.Resolver.DB.QueryRow(`
		SELECT id, student_id, course_id, status, enrolled_at, updated_at 
		FROM registrations WHERE id = $1`, id)

	var registration model.Registration
	err := row.Scan(
		&registration.ID,
		&registration.StudentID,
		&registration.CourseID,
		&registration.Status,
		&registration.EnrolledAt,
		&registration.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("registration not found: %v", err)
	}
	return &registration, nil
}

func (r *queryResolver) Registrations(ctx context.Context) ([]*model.Registration, error) {
	rows, err := r.Resolver.DB.Query(`
		SELECT id, student_id, course_id, status, enrolled_at, updated_at 
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

// === MUTATION RESOLVERS ===

func (r *mutationResolver) CreateRegistration(
	ctx context.Context,
	studentID string,
	courseID string,
	status string,
) (*model.Registration, error) {
	id := uuid.New().String()
	enrolledAt := time.Now().Format(time.RFC3339)
	updatedAt := enrolledAt

	_, err := r.Resolver.DB.Exec(`
		INSERT INTO registrations (id, student_id, course_id, status, enrolled_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6)`,
		id, studentID, courseID, status, enrolledAt, updatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %v", err)
	}

	return &model.Registration{
		ID:         id,
		StudentID:  studentID,
		CourseID:   courseID,
		Status:     status,
		EnrolledAt: enrolledAt,
		UpdatedAt:  updatedAt,
	}, nil
}

func (r *mutationResolver) UpdateRegistration(
	ctx context.Context,
	id string,
	studentID string,
	courseID string,
	status string,
) (*model.Registration, error) {
	updatedAt := time.Now().Format(time.RFC3339)

	_, err := r.Resolver.DB.Exec(`
		UPDATE registrations 
		SET student_id=$1, course_id=$2, status=$3, updated_at=$4 
		WHERE id=$5`,
		studentID, courseID, status, updatedAt, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update registration: %v", err)
	}

	// Return updated registration
	return &model.Registration{
		ID:         id,
		StudentID:  studentID,
		CourseID:   courseID,
		Status:     status,
		EnrolledAt: "", // You could fetch this from DB if needed
		UpdatedAt:  updatedAt,
	}, nil
}

func (r *mutationResolver) DeleteRegistration(ctx context.Context, id string) (*bool, error) {
	_, err := r.Resolver.DB.Exec("DELETE FROM registrations WHERE id=$1", id)
	if err != nil {
		failure := false
		return &failure, fmt.Errorf("failed to delete registration: %v", err)
	}
	success := true
	return &success, nil
}
