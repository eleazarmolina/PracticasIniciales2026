import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarToken } from '../utils/auth';
import './Navbar.css';

const Navbar = ({ usuario }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        eliminarToken();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    CalificaECYS
                </Link>
                
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Inicio</Link>
                    <Link to="/crear-publicacion" className="nav-link">Crear Publicacion</Link>
                    <Link to="/mi-perfil" className="nav-link">Mi Perfil</Link>
                    
                    <div className="navbar-usuario">
                        <span>{usuario?.nombres} {usuario?.apellidos}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Cerrar Sesion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;