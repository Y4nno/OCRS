import React from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client'; // Import useSubscription
import { Link } from 'react-router-dom';
import './css/courses.css';
import courseImage from './Courseimage.jpg';
import Navbar from './navbar';

// GraphQL Query
const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      difficulty
    }
  }
`;

// GraphQL Subscription
const COURSE_CREATED = gql`
  subscription CourseCreated {
    courseCreated {
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

export default function UserCourses() {
  // Fetch data using the useQuery hook
  const { loading, error, data } = useQuery(GET_COURSES, {
    //fetchPolicy: 'network-only',
  });

  // Listen for real-time updates using the useSubscription hook
  const { data: subscriptionData } = useSubscription(COURSE_CREATED, {
    //fetchPolicy: 'network-only',
  });

  // Update the course list dynamically when a new course is created
  if (subscriptionData) {
    const newCourse = subscriptionData.courseCreated;
    if (!data.courses.find((course) => course.id === newCourse.id)) {
      data.courses = [...data.courses, newCourse]; // Add the new course to the list
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error fetching courses:', error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.courses || data.courses.length === 0) {
    return <p>No courses available at the moment.</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="course-container">
          <h2>COURSES</h2>
        </div>

        {/* Display Courses */}
        <div className="courses-wrapper">
          {data.courses.map((course) => (
            <Link
              to={`/courses/${course.id}`} // Redirect to the full course page
              className="course-card"
              key={course.id}
              style={{ textDecoration: 'none', color: 'inherit' }} // Remove link styling
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={courseImage}
                  className="card-img-top"
                  alt={course.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title fs-4 mb-3">{course.name}</h5>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
    </div>
  );
}