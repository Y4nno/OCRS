package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/handler/transport"
    "github.com/99designs/gqlgen/graphql/playground"
    "github.com/gorilla/websocket"
    "github.com/jackc/pgx/v4/pgxpool"
    "github.com/rs/cors"
    "example.com/Course-Service/v2/graph"
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

    // Add WebSocket transport for subscriptions
    allowedOrigins := map[string]bool{
        "http://localhost:3000": true,
        "http://localhost:8080": true,
    }
    
    srv.AddTransport(transport.Websocket{
        KeepAlivePingInterval: 10 * time.Second,
        Upgrader: websocket.Upgrader{
            CheckOrigin: func(r *http.Request) bool {
                origin := r.Header.Get("Origin")
                log.Println("WebSocket request origin:", origin)
                return allowedOrigins[origin]
            },
        },
    })
    srv.AddTransport(transport.Options{}) // <--- Needed for Playground!
    srv.AddTransport(transport.GET{})
    srv.AddTransport(transport.POST{})
    srv.AddTransport(transport.MultipartForm{}) // In case of file uploads    

    // Add HTTP transport for queries and mutations
    srv.AddTransport(transport.POST{})

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

    // Start the server with graceful shutdown
    srvAddr := ":" + port
    server := &http.Server{
        Addr:    srvAddr,
        Handler: corsHandler.Handler(http.DefaultServeMux),
    }

    go func() {
        log.Printf("Server running on http://localhost:%s", port)
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Failed to start server: %v", err)
        }
    }()

    // Wait for termination signal to gracefully shut down the server
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
    <-stop

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited gracefully")
}