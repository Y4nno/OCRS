import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#7B3538',
        boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={require('./lion.png')} alt="lionheart" width="30" height="30" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Payment Related
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/cart">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/history">
                    History
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Student Related
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/cart">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/history">
                    History
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
