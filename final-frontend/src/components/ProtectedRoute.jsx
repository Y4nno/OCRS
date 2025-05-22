import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  // You can also check for a token or other session info here

  if (!username) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  // Logged in, render the protected page
  return children;
}