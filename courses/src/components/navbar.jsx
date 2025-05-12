import { Link } from 'react-router-dom';
import './css/navbar.css'

function Navbar() {
  return (
    <div>
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#7B3538', boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)' }}>
        <div className="container-fluid">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item dropdown">
                        <Link className="nav-link" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Courses
                        </Link>
                    </li>
                </ul>

                <span className="navbar-text me-auto fw-medium text-light" style={{ fontSize: '1.75rem' }}>
                    LIONHEART
                </span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Login</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Register</Link> 
                    </li>
                </ul>            
            </div>
        </div>
    </nav>
    <nav className="navbar navbar-expand-lg  justify-content-center" style={{ backgroundColor: '#7B3538', boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.35)' , marginTop: '-22px', paddingBottom:'25px'}}>
          <div className="search-bar-container">
            <input className="search-bar" style={{ height: '35px', width: '500px', borderRadius: '5px', border: '1px solid #ccc', padding: '5px', boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.35)' }} type="text"/>
          </div>
    </nav>
  </div>
);
}

export default Navbar;