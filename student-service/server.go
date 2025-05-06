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

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	_ "github.com/lib/pq" // PostgreSQL driver
)

const defaultPort = "8080"

// HashPassword hashes a password using SHA-256
func HashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

// ComparePassword compares a hashed password with a plain password
func ComparePassword(hashedPassword, plainPassword string) bool {
	return hashedPassword == HashPassword(plainPassword)
}

// enableCORS adds CORS headers to the response
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Get the port from environment variables or use the default
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Database connection
	db, err := sql.Open("postgres", "postgres://postgres:ryrywrotethiss@localhost:5432/postgres?sslmode=disable")
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
				origin := r.Header.Get("Origin")
				log.Println("WebSocket request origin:", origin)
				return origin == "http://localhost:3000" || origin == "http://localhost:8080"
			},
		},
	})

	// Set up routes with CORS middleware
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", enableCORS(srv))

	// Start the server
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
