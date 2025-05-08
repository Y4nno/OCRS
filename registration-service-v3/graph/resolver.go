package graph

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"registration.mod/registration-v3/graph/model"
)

type Resolver struct {
	DB                *sql.DB
	RegistrationAdded chan *model.Registration
	subscriptionMap   map[chan *model.Registration]bool // Map to store active subscribers
	mu                sync.Mutex
}

func NewResolver(db *sql.DB) *Resolver {
	return &Resolver{
		DB:                db,
		RegistrationAdded: make(chan *model.Registration, 1), // Buffered channel
		subscriptionMap:   make(map[chan *model.Registration]bool),
	}
}

// / ari nalang sa nako ibutang kay kapoy scroll kinalasan
func (r *subscriptionResolver) RegistrationAdded(ctx context.Context) (<-chan *model.Registration, error) {
	updates := make(chan *model.Registration)

	r.Resolver.mu.Lock()
	r.Resolver.subscriptionMap[updates] = true
	r.Resolver.mu.Unlock()

	go func() {
		<-ctx.Done()
		r.Resolver.mu.Lock()
		delete(r.Resolver.subscriptionMap, updates)
		r.Resolver.mu.Unlock()
		close(updates)
	}()

	return updates, nil
}

// === QUERY RESOLVERS ===

func (r *queryResolver) Registration(ctx context.Context, id string) (*model.Registration, error) {
	row := r.Resolver.DB.QueryRow(`
    SELECT id, student_id, course_id, status, enrolled_at, updated_at 
    FROM registrations WHERE id = $1`, id)

	var reg model.Registration
	var status string
	err := row.Scan(&reg.ID, &reg.StudentID, &reg.CourseID, &status, &reg.EnrolledAt, &reg.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("registration not found")
		}
		return nil, fmt.Errorf("failed to fetch registration: %v", err)
	}
	reg.Status = model.RegistrationStatus(status)
	return &reg, nil
}

func (r *queryResolver) Registrations(ctx context.Context) ([]*model.Registration, error) {
	rows, err := r.Resolver.DB.Query(`
    SELECT id, student_id, course_id, status, enrolled_at, updated_at 
    FROM registrations`)
	if err != nil {
		return nil, fmt.Errorf("failed to query registrations: %v", err)
	}
	defer rows.Close()

	var registrations []*model.Registration
	for rows.Next() {
		var reg model.Registration
		var status string
		if err := rows.Scan(&reg.ID, &reg.StudentID, &reg.CourseID, &status, &reg.EnrolledAt, &reg.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning registration: %v", err)
		}
		reg.Status = model.RegistrationStatus(status)
		registrations = append(registrations, &reg)
	}
	return registrations, nil
}

func (r *queryResolver) RegistrationsByStudent(ctx context.Context, studentID string) ([]*model.Registration, error) {
	rows, err := r.Resolver.DB.Query(`
    SELECT id, student_id, course_id, status, enrolled_at, updated_at 
    FROM registrations 
    WHERE student_id = $1`, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to query registrations for student %s: %v", studentID, err)
	}
	defer rows.Close()

	var registrations []*model.Registration
	for rows.Next() {
		var reg model.Registration
		var status string
		if err := rows.Scan(&reg.ID, &reg.StudentID, &reg.CourseID, &status, &reg.EnrolledAt, &reg.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning registration: %v", err)
		}
		reg.Status = model.RegistrationStatus(status)
		registrations = append(registrations, &reg)
	}

	return registrations, nil
}

// === MUTATION RESOLVERS ===

func (r *mutationResolver) CreateRegistration(
	ctx context.Context,
	studentID string,
	courseID string,
	status *model.RegistrationStatus,
) (*model.Registration, error) {
	id := uuid.New().String()
	enrolledAt := time.Now().Format(time.RFC3339)
	updatedAt := enrolledAt

	statusValue := model.RegistrationStatusPending
	if status != nil {
		statusValue = *status
	}

	var exists bool
	err := r.Resolver.DB.QueryRow(`
  SELECT EXISTS (
      SELECT 1 FROM registrations 
      WHERE student_id = $1 AND course_id = $2 AND status IN ('pending', 'enrolled')
  )`, studentID, courseID).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check for duplicate enrollment: %v", err)
	}
	if exists {
		return nil, fmt.Errorf("student is already enrolled or has a pending registration for this course")
	}

	_, err = r.Resolver.DB.Exec(`
  INSERT INTO registrations (id, student_id, course_id, status, enrolled_at, updated_at) 
  VALUES ($1, $2, $3, $4, $5, $6)`,
		id, studentID, courseID, string(statusValue), enrolledAt, updatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %v", err)
	}

	newRegistration := &model.Registration{
		ID:         id,
		StudentID:  studentID,
		CourseID:   courseID,
		Status:     statusValue,
		EnrolledAt: enrolledAt,
		UpdatedAt:  updatedAt,
	}

	r.Resolver.mu.Lock()
	for subChan := range r.Resolver.subscriptionMap {
		subChan <- newRegistration
	}
	r.Resolver.mu.Unlock()

	return newRegistration, nil
}

func (r *mutationResolver) CreateRegistrations(
	ctx context.Context,
	studentID string,
	courseIDs []string,
	status *model.RegistrationStatus,
) (*model.RegistrationBatchResult, error) {
	enrolledAt := time.Now().Format(time.RFC3339)
	updatedAt := enrolledAt

	statusValue := model.RegistrationStatusPending
	if status != nil {
		statusValue = *status
	}

	var createdRegs []*model.Registration
	var skippedCourseIDs []string

	for _, courseID := range courseIDs {
		var exists bool
		err := r.Resolver.DB.QueryRow(`
      SELECT EXISTS (
          SELECT 1 FROM registrations 
          WHERE student_id = $1 AND course_id = $2 AND status IN ('pending', 'enrolled')
      )`, studentID, courseID).Scan(&exists)
		if err != nil {
			return nil, fmt.Errorf("failed to check for duplicate enrollment for course %s: %v", courseID, err)
		}

		if exists {
			skippedCourseIDs = append(skippedCourseIDs, courseID)
			continue
		}

		id := uuid.New().String()
		_, err = r.Resolver.DB.Exec(`
      INSERT INTO registrations (id, student_id, course_id, status, enrolled_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)`,
			id, studentID, courseID, string(statusValue), enrolledAt, updatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to create registration for course %s: %v", courseID, err)
		}

		createdRegs = append(createdRegs, &model.Registration{
			ID:         id,
			StudentID:  studentID,
			CourseID:   courseID,
			Status:     statusValue,
			EnrolledAt: enrolledAt,
			UpdatedAt:  updatedAt,
		})
	}

	r.Resolver.mu.Lock()
	for subChan := range r.Resolver.subscriptionMap {
		for _, reg := range createdRegs {
			subChan <- reg
		}
	}
	r.Resolver.mu.Unlock()

	return &model.RegistrationBatchResult{
		Created:          createdRegs,
		SkippedCourseIDs: skippedCourseIDs,
	}, nil
}

func (r *mutationResolver) UpdateRegistration(
	ctx context.Context,
	id string,
	studentID string,
	courseID string,
	status model.RegistrationStatus,
) (*model.Registration, error) {
	updatedAt := time.Now().Format(time.RFC3339)

	result, err := r.Resolver.DB.Exec(`
    UPDATE registrations 
    SET student_id=$1, course_id=$2, status=$3, updated_at=$4 
    WHERE id=$5`,
		studentID, courseID, string(status), updatedAt, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update registration: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, fmt.Errorf("no registration found with ID %s", id)
	}

	return &model.Registration{
		ID:        id,
		StudentID: studentID,
		CourseID:  courseID,
		Status:    status,
		UpdatedAt: updatedAt,
	}, nil
}

func (r *mutationResolver) DeleteRegistration(ctx context.Context, id string) (*bool, error) {
	result, err := r.Resolver.DB.Exec("DELETE FROM registrations WHERE id=$1", id)
	if err != nil {
		failure := false
		return &failure, fmt.Errorf("failed to delete registration: %v", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		failure := false
		return &failure, fmt.Errorf("no registration found with ID %s", id)
	}
	success := true
	return &success, nil
}

func (r *mutationResolver) DropCourse(ctx context.Context, studentID string, courseID string) (*model.Registration, error) {
	updatedAt := time.Now().Format(time.RFC3339)

	result, err := r.Resolver.DB.Exec(`
        UPDATE registrations
        SET status = 'dropped', updated_at = $1
        WHERE student_id = $2 AND course_id = $3 AND status IN ('pending', 'enrolled')`,
		updatedAt, studentID, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to drop course: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, fmt.Errorf("no active registration found to drop for student %s and course %s", studentID, courseID)
	}

	row := r.Resolver.DB.QueryRow(`
        SELECT id, student_id, course_id, status, enrolled_at, updated_at
        FROM registrations 
        WHERE student_id = $1 AND course_id = $2`, studentID, courseID)

	var reg model.Registration
	var status string
	err = row.Scan(&reg.ID, &reg.StudentID, &reg.CourseID, &status, &reg.EnrolledAt, &reg.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated registration: %v", err)
	}

	reg.Status = model.RegistrationStatus(status)
	return &reg, nil
}
