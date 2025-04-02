package graph

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
	"example.com/Course-Service/v2/graph/model"
)

type Resolver struct{}

// Storage structure with optimized data structures
var (
	storage = struct {
		courses      map[string]*model.Course
		enrollments  []*model.Enrollment
		subjects     []*model.Subject
		teachers     []*model.Teacher
		schedules    []*model.Schedule
		scheduleDays []*model.ScheduleDay
		mutex        sync.RWMutex
		idCounter    uint64
	}{
		courses:      make(map[string]*model.Course),
		enrollments:  make([]*model.Enrollment, 0),
		subjects:     make([]*model.Subject, 0),
		teachers:     make([]*model.Teacher, 0),
		schedules:    make([]*model.Schedule, 0),
		scheduleDays: make([]*model.ScheduleDay, 0),
	}
)

// Course fetches a course by ID using a map for O(1) lookup
func (r *Resolver) Course(ctx context.Context, id string) (*model.Course, error) {
	storage.mutex.RLock()
	course, exists := storage.courses[id]
	storage.mutex.RUnlock()

	if !exists {
		return nil, errors.New("course not found")
	}
	return course, nil
}

// GenerateID using atomic operations for efficiency
func generateID() string {
	return fmt.Sprintf("%d", atomic.AddUint64(&storage.idCounter, 1))
}