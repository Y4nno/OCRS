import './App.css';
import './custom.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterLogin from './RegisterLogin';
import Profile from './Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Ensure Bootstrap JS is included

function App() {
  const location = useLocation();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  return (
    <>
      {/* Render Navbar only if not on the RegisterLogin page */}
      {location.pathname !== '/' && <Navbar />}
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/profile" element={<Profile onUsernameChange={setUsername} />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}