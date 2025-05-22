-- Create 'students' table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    birthdate DATE,
    gender VARCHAR(50),
    location VARCHAR(255),
    bio TEXT,
    interests VARCHAR(255), -- Array of strings to store interests
    hashed_password VARCHAR(255) NOT NULL, -- Renamed from 'password' to 'hashed_password'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fullname VARCHAR(70) NOT NULL
);