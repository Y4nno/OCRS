import React, { useEffect, useState } from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { Link } from 'react-router-dom';
import './css/courses.css';
import courseImage from './Courseimage.jpg';
import Navbar from './navbar';

// GraphQL Queries and Subscriptions
const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      difficulty
    }
  }
`;

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

const COURSE_UPDATED = gql`
  subscription CourseUpdated {
    courseUpdated {
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

const COURSE_DELETED_BY_NAME = gql`
  subscription CourseDeletedByName {
    courseDeletedByName
  }
`;

export default function UserCourses() {
  const { loading, error, data } = useQuery(GET_COURSES);
  const { data: subscriptionData } = useSubscription(COURSE_CREATED);
  const { data: courseUpdatedData } = useSubscription(COURSE_UPDATED);
  const { data: courseDeletedData } = useSubscription(COURSE_DELETED_BY_NAME);

  const [courses, setCourses] = useState([]);

  // Initialize courses when query returns
  useEffect(() => {
    if (data && data.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  // Append new course from subscription
  useEffect(() => {
    if (subscriptionData && subscriptionData.courseCreated) {
      const newCourse = subscriptionData.courseCreated;
      setCourses((prevCourses) => {
        const alreadyExists = prevCourses.some((c) => c.id === newCourse.id);
        return alreadyExists ? prevCourses : [...prevCourses, newCourse];
      });
    }
  }, [subscriptionData]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error fetching courses:', error);
    return <p>Error: {error.message}</p>;
  }

  if (!courses || courses.length === 0) {
    return <p>No courses available at the moment.</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="course-container">
          <h2>COURSES</h2>
        </div>

        <div className="courses-wrapper">
          {courses.map((course) => (
            <Link
              to={`/courses/${course.id}`}
              className="course-card"
              key={course.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
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