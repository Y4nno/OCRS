package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"log"
	"net/http"
	"os"
	"student-service/graph"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	_ "github.com/lib/pq" // PostgreSQL driver
)

const defaultPort = "8081"

// HashPassword hashes a password using SHA-256
func HashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

// ComparePassword compares a hashed password with a plain password
func ComparePassword(hashedPassword, plainPassword string) bool {
	return hashedPassword == HashPassword(plainPassword)
}

func main() {
	// Get the port from environment variables or use the default
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Database connection
	db, err := sql.Open("postgres", "postgres://postgres:admin@localhost:5432/student-service?sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Pass the database connection to the resolver
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{DB: db}}))

	// Add WebSocket transport for subscriptions
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				log.Println("WebSocket request origin:", r.Header.Get("Origin"))
				return true // Allow all origins (for debugging purposes)
			},
		},
	})

	// Configure CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow requests from the frontend
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	// Wrap your GraphQL handler with the CORS middleware
	http.Handle("/query", corsHandler.Handler(srv))

	// Set up routes
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))

	// Start the server
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
