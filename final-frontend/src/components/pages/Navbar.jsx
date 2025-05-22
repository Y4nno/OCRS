// src/components/Navbar.jsx
import '../css/custom.css';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const username = localStorage.getItem('username');
    const studentId = localStorage.getItem('studentId');
return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#7B3538', boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)' }}>
        <div className="container-fluid">
            <a className="navbar-brand" href="#">
                <img src={require('../css/lion.png')} alt="lionheart" width="30" height="30" />
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/profile">My Profile</Link>
                    </li>                    
                    <li className="nav-item">
                        <Link className="nav-link" to="/courses">Courses</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/enrollment">Enrollment</Link>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Payment Related
                        </a>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/cart">Cart</Link></li>
                            <li><Link className="dropdown-item" to="/history">History</Link></li>
                        </ul>
                    </li>
                </ul>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link">
                          Hello, {username}!
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                          className="nav-link"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            localStorage.removeItem('username');
                            localStorage.removeItem('studentId');
                            window.location.href = '/';
                          }}
                        >
                          Sign out
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
);
}
