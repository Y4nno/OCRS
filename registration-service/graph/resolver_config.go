package graph

import "gorm.io/gorm"

// Resolver struct should NOT be in resolver.go because gqlgen overwrites it
type Resolver struct {
	DB *gorm.DB
}
