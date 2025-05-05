import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserCourses from './components/courses';
import FullCoursePage from './components/FullCoursePage';
import CartPage from './components/Cart'; // Import the CartPage component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserCourses />} />
        <Route path="/courses" element={<UserCourses />} />
        <Route path="/courses/:id" element={<FullCoursePage />} />
        <Route path="/cart" element={<CartPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;