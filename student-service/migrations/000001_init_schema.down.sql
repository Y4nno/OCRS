-- Drop education history table first (it depends on students)
DROP TABLE IF EXISTS education_histories;

-- Then drop work experiences (also depends on students)
DROP TABLE IF EXISTS work_experiences;

-- Finally, drop the students table
DROP TABLE IF EXISTS students;
