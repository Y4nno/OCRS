import { Link } from 'react-router-dom';
import '../css/navbar.css'

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
                        <Link className="nav-link" to="/">Sign out</Link> 
                    </li>
                </ul>            
            </div>
        </div>
    </nav>
  </div>
);
}

export default Navbar;