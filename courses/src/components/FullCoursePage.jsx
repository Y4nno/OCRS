import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import './css/FullCoursePage.css'; // Import the CSS file for styling
//import No_bar from './no_search_bar'

// GraphQL Query to Fetch Course by ID
const GET_COURSE_BY_ID = gql`
  query GetCourseById($courseId: ID!) {
    course(courseId: $courseId) {
      id
      name
      price
      duration
      description
      status
      difficulty
      instructor
      createdAt
      updatedAt
    }
  }
`;


export default function FullCoursePage() {
  const { id } = useParams(); // Get the course ID from the URL
  const { loading, error, data } = useQuery(GET_COURSE_BY_ID, {
    variables: { courseId: id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("Error fetching course:", error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.course) {
    return <p>Course not found.</p>;
  }

  const course = data.course;

  return (
    <div className="course-page">
      {/* Hero Section */}
      {/*<No_bar/>*/}
      {/* Course Details Section */}
      <div className="course-details">
        <h2>Course Details</h2>
        <ul>
          <li><strong>Duration:</strong> {course.duration}</li>
          <li><strong>Difficulty:</strong> {course.difficulty}</li>
          <li><strong>Status:</strong> {course.status}</li>
          <li><strong>Instructor:</strong> {course.instructor}</li>
          <li><strong>Price:</strong> ${course.price}</li>
        </ul>
      </div>

      {/* Course Description Section */}
      <div className="course-description">
        <h2>Course Description</h2>
        <p>{course.description}</p>
      </div>

      {/* Course Materials Section */}
      <div className="course-materials">
        <h2>Course Materials</h2>
        <ul>
          <li>Key concepts and skills related to {course.name}</li>
          <li>Practical applications of the course material</li>
          <li>Insights from industry experts</li>
        </ul>
      </div>
    </div>
  );
}