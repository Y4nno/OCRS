import React from 'react';
import './custom.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EnrollmentPage from './components/EnrollmentPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<EnrollmentPage />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
      </Routes>
    </>
  );
}

export default App;