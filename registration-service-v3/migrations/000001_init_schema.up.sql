CREATE TYPE registration_status AS ENUM ('pending', 'enrolled', 'completed', 'dropped', 'failed');

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    status registration_status NOT NULL DEFAULT 'pending',
    enrolled_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
