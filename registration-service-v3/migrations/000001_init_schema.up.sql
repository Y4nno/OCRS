CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    term TEXT NOT NULL,
    grade TEXT,
    status TEXT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
