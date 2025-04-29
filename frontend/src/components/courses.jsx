import React from 'react';
import { gql, useQuery } from '@apollo/client'; // Import useQuery
import { Link } from 'react-router-dom';
import './courses.css';
import courseImage from './Courseimage.jpg';

// Navbar Component
function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#7B3538', boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)' }}>
      <div className="navbar-top">
        <div className="home-courses-container">
          <Link to="/">
            Home
          </Link>
          <Link to="/courses">
            Courses
          </Link>
        </div>
        <div className="lionheart-container">
          <h1>LIONHEART</h1>
        </div>
        <div className="login-register-container">
          <Link to="/">
            Login
          </Link>
          <Link to="/courses">
            Register
          </Link>
        </div>
      </div>
      <div className="navbar-bottom">
        <div className="search-bar-container">
          <input className="search-bar"/>
        </div>
      </div>
    </nav>
  );
}

// GraphQL Query
const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      enrollees
      difficulty
    }
  }
`;

export default function UserCourses() {
  // Fetch data using the useQuery hook
  const { loading, error, data } = useQuery(GET_COURSES);

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
      {/* Include Navbar */}
      <Navbar />

      <div className="container py-5">
        <h2 className="mb-4 text-center">COURSES</h2>

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