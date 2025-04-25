-- Create 'students' table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    birthdate DATE,
    gender VARCHAR(50),
    location VARCHAR(255),
    bio TEXT,
    interests TEXT[], -- Array of strings to store interests
    hashed_password VARCHAR(255) NOT NULL, -- Renamed from 'password' to 'hashed_password'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
