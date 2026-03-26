import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { estaAutenticado, obtenerUsuarioActual, eliminarToken } from './utils/auth';
import './App.css';

// Importar componentes
import Login from './components/Login';
import Registro from './components/Registro';
import RecuperarPassword from './components/RecuperarPassword';
import Publicaciones from './components/Publicaciones';
import CrearPublicacion from './components/CrearPublicacion';
import Comentarios from './components/Comentarios';
import Perfil from './components/Perfil';
import Navbar from './components/Navbar';

// Componente para rutas protegidas
const RutaProtegida = ({ children, setAuth }) => {
    const [isAuth, setIsAuth] = useState(estaAutenticado());

    useEffect(() => {
        setIsAuth(estaAutenticado());
    }, []);

    if (!isAuth) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    const [auth, setAuth] = useState(estaAutenticado());
    const [usuario, setUsuario] = useState(obtenerUsuarioActual());

    // Función para verificar autenticación
    const verificarAuth = () => {
        setAuth(estaAutenticado());
        setUsuario(obtenerUsuarioActual());
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        eliminarToken();
        setAuth(false);
        setUsuario(null);
    };

    useEffect(() => {
        verificarAuth();
    }, []);

    return (
        <Router>
            {/* Navbar se muestra solo si auth es true */}
            {auth && <Navbar usuario={usuario} onLogout={handleLogout} />}
            <div className="container">
                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={verificarAuth} />} />
                    <Route path="/registro" element={<Registro onRegistroSuccess={verificarAuth} />} />
                    <Route path="/recuperar" element={<RecuperarPassword />} />
                    
                    <Route path="/" element={
                        <RutaProtegida setAuth={verificarAuth}>
                            <Publicaciones />
                        </RutaProtegida>
                    } />
                    <Route path="/crear-publicacion" element={
                        <RutaProtegida setAuth={verificarAuth}>
                            <CrearPublicacion />
                        </RutaProtegida>
                    } />
                    <Route path="/publicaciones/:id/comentarios" element={
                        <RutaProtegida setAuth={verificarAuth}>
                            <Comentarios />
                        </RutaProtegida>
                    } />
                    <Route path="/perfil/:registro" element={
                        <RutaProtegida setAuth={verificarAuth}>
                            <Perfil />
                        </RutaProtegida>
                    } />
                    <Route path="/mi-perfil" element={
                        <RutaProtegida setAuth={verificarAuth}>
                            <Perfil esMiPerfil={true} />
                        </RutaProtegida>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;