// src/App.js
import './components/css/custom.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/pages/Navbar';
import History from './components/pages/History'; 
import CartPage from './components/pages/CartPage';
import Courses from './components/pages/courses';
import Enrollment from './components/pages/EnrollmentPage';
import FullCoursePage from './components/pages/FullCoursePage';
import Profile from './components/pages/Profile'
import RegisterLogin from './components/pages/regisLogin';
import { ApolloProvider } from '@apollo/client';
import { useApolloClients } from './ApolloClientsContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { payment, course, regis, student } = useApolloClients();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const location = useLocation();

  // Hide Navbar on login/register page
  const hideNavbar = location.pathname === '/' || location.pathname === '/register-login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"
        element={
          <ApolloProvider client={student}>
            <RegisterLogin />
          </ApolloProvider>
          } 
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <ApolloProvider client={payment}>
                <CartPage />
              </ApolloProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <ApolloProvider client={payment}>
                <History />
              </ApolloProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <ApolloProvider client={course}>
                <Courses />
              </ApolloProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <ApolloProvider client={course}>
                <FullCoursePage />
              </ApolloProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment"
          element={
            <ApolloProvider client={regis}>
              <Enrollment />
            </ApolloProvider>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ApolloProvider client={student}>
                <Profile onUsernameChange={setUsername} />
              </ApolloProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
