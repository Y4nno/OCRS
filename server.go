package main

import (
    "context"
    "log"
    "net/http"
    "os"

    "example.com/Course-Service/v2/graph"
    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/playground"
    "github.com/jackc/pgx/v4/pgxpool"
    "github.com/rs/cors" // Import the CORS library
)

const defaultPort = "8080"

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = defaultPort
    }

    // Configure database connection
    pool, err := pgxpool.Connect(context.Background(), "postgres://postgres:123@localhost:5432/Course_db")
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer pool.Close()

    // Initialize resolver
    resolver := &graph.Resolver{DB: pool}

    // Configure GraphQL server
    srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
        Resolvers: resolver,
    }))

    // Set up CORS middleware
    corsHandler := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8080"}, // Allow both React app and Playground
        AllowCredentials: true,
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"}, // Allow these HTTP methods
        AllowedHeaders:   []string{"Authorization", "Content-Type"}, // Allow these headers
        OptionsPassthrough: false, // Ensure OPTIONS requests are handled
        Debug: true, // Enable debugging to log CORS-related issues
    })

    // Attach handlers
    http.Handle("/", playground.Handler("GraphQL Playground", "/query"))
    http.Handle("/query", srv) // Attach the GraphQL server

    // Start the server with CORS middleware applied globally
    log.Printf("Server running on http://localhost:%s", port)
    log.Fatal(http.ListenAndServe(":"+port, corsHandler.Handler(http.DefaultServeMux)))
}