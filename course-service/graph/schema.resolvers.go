package graph

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sync"
	"time"

	"example.com/Course-Service/v2/graph/model"
)

// Subscription channels
var (
	courseCreatedSubscribers       sync.Map
	courseUpdatedSubscribers       sync.Map
	courseDeletedByNameSubscribers sync.Map
)

// Mutation resolvers
func (r *mutationResolver) CreateCourse(ctx context.Context, input model.CourseInput) (*model.Course, error) {
	query := `
        INSERT INTO courses (
            name, 
            price, 
            duration, 
            description, 
            status, 
            difficulty, 
            instructor
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at, updated_at
    `

	var id string
	var createdAt, updatedAt time.Time

	err := r.DB.QueryRowContext(
		ctx,
		query,
		input.Name,
		input.Price,
		input.Duration,
		input.Description,
		input.Status.String(),
		input.Difficulty.String(),
		input.Instructor,
	).Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create course: %v", err)
	}

	course := &model.Course{
		ID:          id,
		Name:        input.Name,
		Price:       input.Price,
		Duration:    input.Duration,
		Description: input.Description,
		Status:      input.Status,
		Difficulty:  input.Difficulty,
		Instructor:  input.Instructor,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}

	go r.publishCourseCreated(course)
	return course, nil
}

func (r *mutationResolver) UpdateCourse(ctx context.Context, id string, input model.CourseInput) (*model.Course, error) {
	query := `
        UPDATE courses
        SET 
            name = ?,
            price = ?,
            duration = ?,
            description = ?,
            status = ?,
            difficulty = ?,
            instructor = ?,
            updated_at = NOW()
        WHERE id = ?
        RETURNING created_at, updated_at
    `

	var createdAt, updatedAt time.Time

	err := r.DB.QueryRowContext(
		ctx,
		query,
		input.Name,
		input.Price,
		input.Duration,
		input.Description,
		input.Status.String(),
		input.Difficulty.String(),
		input.Instructor,
		id,
	).Scan(&createdAt, &updatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("course with id %s not found", id)
		}
		return nil, fmt.Errorf("failed to update course: %w", err)
	}

	course := &model.Course{
		ID:          id,
		Name:        input.Name,
		Price:       input.Price,
		Duration:    input.Duration,
		Description: input.Description,
		Status:      input.Status,
		Difficulty:  input.Difficulty,
		Instructor:  input.Instructor,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}

	go r.publishCourseUpdated(course)
	return course, nil
}

func (r *mutationResolver) DeleteCourseByName(ctx context.Context, name string) (bool, error) {
	query := `DELETE FROM courses WHERE name = ?`

	result, err := r.DB.ExecContext(ctx, query, name)
	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("failed to get rows affected: %w", err)
	}

	deleted := rowsAffected > 0
	if deleted {
		go r.publishCourseDeletedByName(true)
	}

	return deleted, nil
}

// Query resolvers
func (r *queryResolver) Course(ctx context.Context, courseID string) (*model.Course, error) {
	var course model.Course
	err := r.DB.QueryRowContext(ctx, `
        SELECT 
            id, name, price, duration, description, 
            status, difficulty, instructor, created_at, updated_at
        FROM courses
        WHERE id = $1
        ORDER BY id DESC  -- Fixed: Specify column name
    `, courseID).Scan(
		&course.ID,
		&course.Name,
		&course.Price,
		&course.Duration,
		&course.Description,
		&course.Status,
		&course.Difficulty,
		&course.Instructor,
		&course.CreatedAt,
		&course.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("course with id %s not found", courseID)
		}
		return nil, fmt.Errorf("failed to fetch course: %w", err)
	}

	return &course, nil
}

func (r *queryResolver) Courses(ctx context.Context) ([]*model.Course, error) {
	rows, err := r.DB.QueryContext(ctx, `
        SELECT 
            id, name, price, duration, description, 
            status, difficulty, instructor, created_at, updated_at
        FROM courses
        ORDER BY id DESC  -- Fixed: Specify column name
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch courses: %w", err)
	}
	defer rows.Close()

	var courses []*model.Course
	for rows.Next() {
		var course model.Course
		err := rows.Scan(
			&course.ID,
			&course.Name,
			&course.Price,
			&course.Duration,
			&course.Description,
			&course.Status,
			&course.Difficulty,
			&course.Instructor,
			&course.CreatedAt,
			&course.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan course: %w", err)
		}
		courses = append(courses, &course)
	}

	return courses, nil
}

// Subscription resolvers
func (r *subscriptionResolver) CourseCreated(ctx context.Context) (<-chan *model.Course, error) {
	ch := make(chan *model.Course)
	id := fmt.Sprintf("%p", ch)

	r.subscribe(&courseCreatedSubscribers, id, ch)

	go func() {
		<-ctx.Done()
		r.unsubscribe(&courseCreatedSubscribers, id)
		close(ch)
	}()

	return ch, nil
}

func (r *subscriptionResolver) CourseUpdated(ctx context.Context) (<-chan *model.Course, error) {
	ch := make(chan *model.Course)
	id := fmt.Sprintf("%p", ch)

	r.subscribe(&courseUpdatedSubscribers, id, ch)

	go func() {
		<-ctx.Done()
		r.unsubscribe(&courseUpdatedSubscribers, id)
		close(ch)
	}()

	return ch, nil
}

func (r *subscriptionResolver) CourseDeletedByName(ctx context.Context) (<-chan bool, error) {
	ch := make(chan bool)
	id := fmt.Sprintf("%p", ch)

	r.subscribe(&courseDeletedByNameSubscribers, id, ch)

	go func() {
		<-ctx.Done()
		r.unsubscribe(&courseDeletedByNameSubscribers, id)
		close(ch)
	}()

	return ch, nil
}

// Helper methods for subscriptions
func (r *subscriptionResolver) subscribe(subscribers *sync.Map, id string, ch interface{}) {
	subscribers.Store(id, ch)
}

func (r *subscriptionResolver) unsubscribe(subscribers *sync.Map, id string) {
	subscribers.Delete(id)
}

func (r *mutationResolver) publishCourseCreated(course *model.Course) {
	courseCreatedSubscribers.Range(func(_, value interface{}) bool {
		ch := value.(chan *model.Course)
		ch <- course
		return true
	})
}

func (r *mutationResolver) publishCourseUpdated(course *model.Course) {
	courseUpdatedSubscribers.Range(func(_, value interface{}) bool {
		ch := value.(chan *model.Course)
		ch <- course
		return true
	})
}

func (r *mutationResolver) publishCourseDeletedByName(deleted bool) {
	courseDeletedByNameSubscribers.Range(func(_, value interface{}) bool {
		ch := value.(chan bool)
		ch <- deleted
		return true
	})
}

// Resolver implementations
func (r *Resolver) Mutation() MutationResolver         { return &mutationResolver{r} }
func (r *Resolver) Query() QueryResolver               { return &queryResolver{r} }
func (r *Resolver) Subscription() SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
