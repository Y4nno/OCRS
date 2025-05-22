# LionHeart – Online Course Registration Service (Final Project)

An OCRS built with Go, PostgreSQL, GraphQL, and React. The platform is designed to handle student enrollments, course management, payment processing, and registration tracking through independent microservices.  

Project documentation found in Google Docs.

---
#### 🧱 Project Structure
```
OCRS/
├── student-service/         # Handles student records and basic authentication
│   └── server.go            # Runs on port 8081
├── course-service/          # Manages courses and handles add-to-cart logic
│   └── server.go            # Runs on port 8082
├── registration-service/    # Manages course enrollments and registration status
│   └── server.go            # Runs on port 8083
├── payment-service/         # Handles payments and transaction tracking
│   └── server.go            # Runs on port 8084
├── final-frontend/          # Centralized React app combining all service frontends into one cohesive UI.
```
---
#### 📡 Architecture Overview
##### Each service runs independently and communicates through:
- REST/GraphQL APIs
- ActiveMQ (via STOMP) for asynchronous messaging (e.g., syncing enrollments, cart updates)
---
#### 🛠️ Tech Stack
- Go (Golang) – Backend language
- PostgreSQL – Relational database
- GraphQL + gqlgen – API layer (backend side)
- Apollo Client – Connects frontend to the API
- React + Bootstrap – Frontend framework
- Python - Database/Message queues automation for testing
- ActiveMQ – Messaging broker for async comms

---
#### 🧪 Running the Project locally
💡 Note: Make sure PostgreSQL (databases of the services exists) and ActiveMQ are running, and script-toFill.py is executed from the payment-service/python/ directory.
```
cd student-service && go run server.go
cd course-service && go run server.go
cd registration-service-v3 && go run server.go
cd payment-service && go run server.go
cd final-frontend && npm start
```
---
#### 📎 Future Improvements
- Switch to Docker for easier orchestration
- Implement centralized gateway API
- Integrate real payment APIs (e.g., PayMongo or Stripe)
- Add authentication and role-based access
- Improve UI/UX consistency across services
---
#### 💌 A Note From Us
We’re just a bunch of broke IT students trying to survive. This project is built with love, late nights, and questionable code quality (that may potentially fail QA). It’s not perfect, but it’s ours. Please be kind. 🥲
