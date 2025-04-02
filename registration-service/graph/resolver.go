package graph

// THIS CODE WILL BE UPDATED WITH SCHEMA CHANGES. PREVIOUS IMPLEMENTATION FOR SCHEMA CHANGES WILL BE KEPT IN THE COMMENT SECTION. IMPLEMENTATION FOR UNCHANGED SCHEMA WILL BE KEPT.

import (
	"context"
	"fmt"
	"registration-service/graph/generated"
	"registration-service/graph/model"
	"time"

	"github.com/google/uuid"
)

type Resolver struct{}

// CreateRegistration is the resolver for the createRegistration field.
func (r *mutationResolver) CreateRegistration(ctx context.Context, input model.RegistrationInput) (*model.Registration, error) {
	newRegistration := &model.Registration{
		ID:         uuid.NewString(),
		StudentID:  input.StudentID,
		CourseID:   input.CourseID,
		Term:       input.Term,
		Grade:      input.Grade,
		Status:     input.Status,
		EnrolledAt: time.Now().Format(time.RFC3339),
		UpdatedAt:  time.Now().Format(time.RFC3339),
	}

	if err := r.Resolver.DB.Create(newRegistration).Error; err != nil {
		return nil, fmt.Errorf("failed to create registration: %v", err)
	}

	return newRegistration, nil
}

// UpdateRegistration is the resolver for the updateRegistration field.
func (r *mutationResolver) UpdateRegistration(ctx context.Context, id string, input model.RegistrationInput) (*model.Registration, error) {
	var registration model.Registration
	if err := r.Resolver.DB.First(&registration, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("registration not found")
	}

	registration.StudentID = input.StudentID
	registration.CourseID = input.CourseID
	registration.Term = input.Term
	registration.Grade = input.Grade
	registration.Status = input.Status
	registration.UpdatedAt = time.Now().Format(time.RFC3339)

	if err := r.Resolver.DB.Save(&registration).Error; err != nil {
		return nil, fmt.Errorf("failed to update registration: %v", err)
	}

	return &registration, nil
}

// DeleteRegistration is the resolver for the deleteRegistration field.
func (r *mutationResolver) DeleteRegistration(ctx context.Context, id string) (*model.DeleteResponse, error) {
	if err := r.Resolver.DB.Delete(&model.Registration{}, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("failed to delete registration: %v", err)
	}

	return &model.DeleteResponse{Message: "Registration deleted successfully"}, nil
}

// Registrations is the resolver for the registrations field.
func (r *queryResolver) Registrations(ctx context.Context) ([]*model.Registration, error) {
	var registrations []*model.Registration
	if err := r.Resolver.DB.Find(&registrations).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch registrations: %v", err)
	}

	return registrations, nil
}

// Registration is the resolver for the registration field.
func (r *queryResolver) Registration(ctx context.Context, id string) (*model.Registration, error) {
	var registration model.Registration
	if err := r.Resolver.DB.First(&registration, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("registration not found")
	}

	return &registration, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
/*
	type Resolver struct{DB *gorm.DB}
*/
