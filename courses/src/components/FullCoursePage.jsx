import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import './css/FullCoursePage.css';

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
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_COURSE_BY_ID, {
    variables: { courseId: id },
  });

  const handleAddToCart = async () => {
    const studentId = "12345"; // Replace with real ID from context/auth

    try {
      const response = await fetch("http://localhost:8080/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId,
          courseId: data.course.id,
          courseName: data.course.name,
          price: data.course.price,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Something went wrong");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const course = data.course;

  return (
    <div className="course-page">
      <div className="course-details">
        <div className="fix-alignment">
          <h2>Course Details</h2>
          <button className="btn primary-btn" onClick={handleAddToCart}>Add to Cart</button>
        </div>
        <ul>
          <li><strong>Duration:</strong> {course.duration}</li>
          <li><strong>Difficulty:</strong> {course.difficulty}</li>
          <li><strong>Status:</strong> {course.status}</li>
          <li><strong>Instructor:</strong> {course.instructor}</li>
          <li><strong>Price:</strong> ${course.price}</li>
        </ul>
      </div>

      <div className="course-description">
        <h2>Course Description</h2>
        <p>{course.description}</p>
      </div>

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
