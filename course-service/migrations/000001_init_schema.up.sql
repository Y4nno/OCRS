-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('AVAILABLE', 'UNAVAILABLE', 'ENLISTED')
    ),
    difficulty VARCHAR(20) NOT NULL CHECK (
        difficulty IN ('INTRODUCTION', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED')
    ),
    instructor VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- UUID for flexibility
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,  -- Changed from UUID to INT
    student_id UUID NOT NULL,  -- Assuming future integration with a students table
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')
    ),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);