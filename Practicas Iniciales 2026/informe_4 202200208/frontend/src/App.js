import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { estaAutenticado, obtenerUsuarioActual } from './utils/auth';
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
const RutaProtegida = ({ children }) => {
    if (!estaAutenticado()) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    const usuario = obtenerUsuarioActual();

    return (
        <Router>
            {estaAutenticado() && <Navbar usuario={usuario} />}
            <div className="container">
                <Routes>
                    {/* Rutas publicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/recuperar" element={<RecuperarPassword />} />
                    
                    {/* Rutas protegidas */}
                    <Route path="/" element={
                        <RutaProtegida>
                            <Publicaciones />
                        </RutaProtegida>
                    } />
                    <Route path="/crear-publicacion" element={
                        <RutaProtegida>
                            <CrearPublicacion />
                        </RutaProtegida>
                    } />
                    <Route path="/publicaciones/:id/comentarios" element={
                        <RutaProtegida>
                            <Comentarios />
                        </RutaProtegida>
                    } />
                    <Route path="/perfil/:registro" element={
                        <RutaProtegida>
                            <Perfil />
                        </RutaProtegida>
                    } />
                    <Route path="/mi-perfil" element={
                        <RutaProtegida>
                            <Perfil esMiPerfil={true} />
                        </RutaProtegida>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;