CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'ENLISTED')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('INTRODUCTION', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    instructor VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,  -- Changed from UUID to SERIAL for auto-incrementing IDs
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,  -- Changed from UUID to TEXT
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);