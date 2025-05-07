// filepath: d:\USER\Documents\RZ - School Files\Github\OCRS\registration-service-v3\server.go

package main

import (
    "database/sql"
    "log"
    "net/http"
    "os"
    "time"

    _ "github.com/lib/pq"

    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/handler/extension"
    "github.com/99designs/gqlgen/graphql/handler/lru"
    "github.com/99designs/gqlgen/graphql/handler/transport"
    "github.com/99designs/gqlgen/graphql/playground"
    "github.com/gorilla/websocket"
    "github.com/rs/cors"
    "github.com/vektah/gqlparser/v2/ast"
    "registration.mod/registration-v3/graph"
    "registration.mod/registration-v3/graph/model"
)

const defaultPort = "8080"

var db *sql.DB

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = defaultPort
    }

    dsn := "postgres://postgres:mypass@localhost:5432/registration_service?sslmode=disable"
    var err error
    db, err = sql.Open("postgres", dsn)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    if err := db.Ping(); err != nil {
        log.Fatal("Database connection is not alive:", err)
    }

    log.Println("Connected to PostgreSQL successfully! 🎉")

    srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
        DB:                db,
        RegistrationAdded: make(chan *model.Registration, 1), // Buffered channel
    }}))

    srv.AddTransport(transport.Websocket{
        KeepAlivePingInterval: 10 * time.Second,
        Upgrader: websocket.Upgrader{
            CheckOrigin: func(r *http.Request) bool {
                // Allow requests from your frontend and GraphQL Playground
                origin := r.Header.Get("Origin")
                return origin == "http://localhost:3000" || origin == "http://localhost:8080"
            },
        },
    })

    srv.AddTransport(transport.Options{})
    srv.AddTransport(transport.GET{})
    srv.AddTransport(transport.POST{})

    srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

    srv.Use(extension.Introspection{})
    srv.Use(extension.AutomaticPersistedQuery{
        Cache: lru.New[string](100),
    })

    corsHandler := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8080"},
        AllowCredentials: true,
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
    })

    http.Handle("/", playground.Handler("GraphQL playground", "/query"))
    http.Handle("/query", corsHandler.Handler(srv))

    log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}