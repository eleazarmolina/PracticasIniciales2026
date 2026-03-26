import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { guardarToken, guardarUsuario } from '../utils/auth';
import './Formularios.css';

const Login = ({ onLoginSuccess }) => {  
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        registro_academico: '',
        contraseña: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const response = await login(formData);
            guardarToken(response.data.token);
            guardarUsuario(response.data.usuario);
            
           
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            
            navigate('/');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.error);
            } else {
                setError('Error de conexion con el servidor');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="formulario-container">
            <h2>Inicio de Sesion</h2>
            <form onSubmit={handleSubmit} className="formulario">
                {error && <div className="error-mensaje">{error}</div>}
                
                <div className="campo">
                    <label>Registro Academico:</label>
                    <input
                        type="text"
                        name="registro_academico"
                        value={formData.registro_academico}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="campo">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                </button>

                <div className="enlaces">
                    <Link to="/registro">Registrarse</Link>
                    <Link to="/recuperar">¿Olvido su contraseña?</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;