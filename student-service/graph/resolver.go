package graph

import (
	"database/sql"
)

// Resolver struct to hold the database connection
type Resolver struct {
	DB *sql.DB
}
