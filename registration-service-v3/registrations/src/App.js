import React from 'react';
import './custom.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EnrollmentPage from './components/EnrollmentPage';

function App() {
  return (
    <router>
      <Navbar />
      <Routes>
        <Route path="/enrollment" element={<EnrollmentPage />} />
      </Routes>
    </router>
  );
}

export default App;