import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recuperarPassword } from '../services/api';
import './Formularios.css';

const RecuperarPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        registro_academico: '',
        correo: '',
        nueva_contraseña: ''
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
            await recuperarPassword(formData);
            setExito('Contraseña actualizada exitosamente. Redirigiendo al login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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
            <h2>Recuperar Contraseña</h2>
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
                    <label>Nueva Contraseña:</label>
                    <input
                        type="password"
                        name="nueva_contraseña"
                        value={formData.nueva_contraseña}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Procesando...' : 'Recuperar Contraseña'}
                </button>

                <div className="enlaces">
                    <Link to="/login">Volver al login</Link>
                </div>
            </form>
        </div>
    );
};

export default RecuperarPassword;