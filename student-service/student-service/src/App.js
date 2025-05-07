import './App.css';
import './custom.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterLogin from './RegisterLogin';
import Profile from './Profile';

function App() {
  const location = useLocation();

  return (
    <>
      {/* Render Navbar only if not on the RegisterLogin page */}
      {location.pathname !== '/' && <Navbar />}
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/profile" element={<Profile />} />
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