import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ usuario, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();  
        navigate('/login');
    };

    
    const obtenerIniciales = () => {
        if (!usuario) return '?';
        const primeraLetra = usuario.nombres ? usuario.nombres.charAt(0) : '';
        const segundaLetra = usuario.apellidos ? usuario.apellidos.charAt(0) : '';
        return `${primeraLetra}${segundaLetra}`.toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="Logo" className="navbar-logo-img" />
                    <span>CalificaECYS</span>
                </Link>
                
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Inicio</Link>
                    <Link to="/crear-publicacion" className="nav-link">Crear Publicacion</Link>
                    <Link to="/mi-perfil" className="nav-link">Mi Perfil</Link>
                    
                    <div className="navbar-usuario">
                        <div className="avatar">
                            {obtenerIniciales()}
                        </div>
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