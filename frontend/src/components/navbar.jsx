import { Link } from 'react-router-dom';
import './navbar.css'

function Navbar() {
    return (
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#7B3538', boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)' }}>
        <div className="navbar-top">
          <div className="home-courses-container">
            <a href="#">
              Home
            </a>
            <Link to ="/courses">
              Courses
            </Link>
          </div>
          <div className="lionheart-container">
            <h1>LIONHEART</h1>
          </div>
          <div className="login-register-container">
            <Link to = "/Cart">
              Cart
            </Link>
            <a href="#">
              Login
            </a>
            <a href="#">
              Register
            </a>
          </div>
        </div>
        <div className="navbar-bottom">
          <div className="search-bar-container">
            <input className="search-bar"/>
          </div>
        </div>
      </nav>
    );
  }

export default Navbar;