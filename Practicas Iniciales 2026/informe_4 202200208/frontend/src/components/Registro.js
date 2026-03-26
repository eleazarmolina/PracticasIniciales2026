import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registro } from '../services/api';
import { guardarToken, guardarUsuario } from '../utils/auth';
import './Formularios.css';

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        registro_academico: '',
        nombres: '',
        apellidos: '',
        correo: '',
        contraseña: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
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
        setExito('');
        setCargando(true);

        try {
            const response = await registro(formData);
            guardarToken(response.data.token);
            guardarUsuario(response.data.usuario);
            setExito('Registro exitoso. Redirigiendo...');
            setTimeout(() => {
                navigate('/');
            }, 2000);
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
            <h2>Registro de Usuario</h2>
            <form onSubmit={handleSubmit} className="formulario">
                {error && <div className="error-mensaje">{error}</div>}
                {exito && <div className="exito-mensaje">{exito}</div>}

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
                    <label>Nombres:</label>
                    <input
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="campo">
                    <label>Apellidos:</label>
                    <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="campo">
                    <label>Correo Electronico:</label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
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
                        minLength="6"
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Registrando...' : 'Registrarse'}
                </button>

                <div className="enlaces">
                    <Link to="/login">Ya tengo cuenta</Link>
                </div>
            </form>
        </div>
    );
};

export default Registro;