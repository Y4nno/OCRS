import React from 'react';
import './Navbar.css';

export default function Navbar() {
  const username = localStorage.getItem('username'); // Retrieve username from localStorage

  const handleSignOut = () => {
    localStorage.removeItem('username'); // Clear username from localStorage
    window.location.href = '/'; // Redirect to login page
  };

  return (
    <div className="navbar">
      <div className="navbar-links">
        <a href="/home">Home</a>
        <a href="/cart">Cart</a>
        <a href="/receipt">Receipt</a>
        <a href="/courses">My Courses</a>
        <a href="/profile" className="active">My Profile</a>
      </div>
      <div className="navbar-user">
        <span className="navbar-username">Hello, {username || 'Guest'}!</span>
        <button onClick={handleSignOut} className="signout-btn">Sign out</button>
      </div>
    </div>
  );
}