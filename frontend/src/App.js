import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserCourses from './components/courses';
import FullCoursePage from './components/FullCoursePage'; // Import the full course page
import './components/navbar.css'; // Import the navbar.css file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserCourses />} />
        <Route path="/courses/:id" element={<FullCoursePage />} /> {/* Dynamic route */}
      </Routes>
    </Router>
  );
}

export default App;