import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerUsuarioPorRegistro, actualizarPerfil } from '../services/api';
import { guardarUsuario, obtenerUsuarioActual } from '../utils/auth';
import CursosAprobados from './CursosAprobados';
import './Perfil.css';

const Perfil = ({ esMiPerfil = false }) => {
    const { registro } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correo: ''
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [buscarRegistro, setBuscarRegistro] = useState('');
    const [mostrarCursos, setMostrarCursos] = useState(false);

    useEffect(() => {
        cargarUsuario();
    }, [registro, esMiPerfil]);

    const cargarUsuario = async () => {
        setCargando(true);
        try {
            let registroABuscar = registro;
            if (esMiPerfil) {
                const usuarioActual = obtenerUsuarioActual();
                registroABuscar = usuarioActual?.registro_academico;
            }
            
            const response = await obtenerUsuarioPorRegistro(registroABuscar);
            setUsuario(response.data.data);
            setFormData({
                nombres: response.data.data.nombres,
                apellidos: response.data.data.apellidos,
                correo: response.data.data.correo
            });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Usuario no encontrado');
            } else {
                setError('Error al cargar el perfil');
            }
        } finally {
            setCargando(false);
        }
    };

    const handleBuscarUsuario = (e) => {
        e.preventDefault();
        if (buscarRegistro.trim()) {
            navigate(`/perfil/${buscarRegistro}`);
            setBuscarRegistro('');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        
        try {
            await actualizarPerfil(usuario.id_usuario, formData);
            
            const usuarioActualizado = {
                ...usuario,
                ...formData
            };
            guardarUsuario(usuarioActualizado);
            setUsuario(usuarioActualizado);
            setModoEdicion(false);
            setExito('Perfil actualizado correctamente');
            
            setTimeout(() => setExito(''), 3000);
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error);
            } else {
                setError('Error al actualizar perfil');
            }
        }
    };

    if (cargando) {
        return <div className="cargando">Cargando perfil...</div>;
    }

    if (error && !usuario) {
        return (
            <div className="perfil-error">
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

    return (
        <div className="perfil-container">
            <div className="perfil-header">
                <button onClick={() => navigate(-1)} className="btn-volver">
                    ← Volver
                </button>
                <h2>Perfil de Usuario</h2>
            </div>

            {/* Buscador de usuarios */}
            <div className="buscador-usuario">
                <form onSubmit={handleBuscarUsuario}>
                    <input
                        type="text"
                        placeholder="Buscar usuario por registro academico..."
                        value={buscarRegistro}
                        onChange={(e) => setBuscarRegistro(e.target.value)}
                    />
                    <button type="submit">Buscar</button>
                </form>
            </div>

            <div className="perfil-card">
                {error && !modoEdicion && <div className="error-mensaje">{error}</div>}
                {exito && <div className="exito-mensaje">{exito}</div>}
                
                <div className="perfil-info">
                    <div className="info-campo">
                        <label>Registro Academico:</label>
                        <span>{usuario.registro_academico}</span>
                    </div>

                    {modoEdicion ? (
                        <form onSubmit={handleActualizar}>
                            <div className="info-campo">
                                <label>Nombres:</label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="info-campo">
                                <label>Apellidos:</label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="info-campo">
                                <label>Correo:</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="perfil-botones">
                                <button type="button" onClick={() => setModoEdicion(false)} className="btn-cancelar">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="info-campo">
                                <label>Nombres:</label>
                                <span>{usuario.nombres}</span>
                            </div>
                            <div className="info-campo">
                                <label>Apellidos:</label>
                                <span>{usuario.apellidos}</span>
                            </div>
                            <div className="info-campo">
                                <label>Correo:</label>
                                <span>{usuario.correo}</span>
                            </div>
                            <div className="info-campo">
                                <label>Fecha de registro:</label>
                                <span>{new Date(usuario.fecha_registro).toLocaleDateString('es-GT')}</span>
                            </div>
                            
                            {esMiPerfil && (
                                <button onClick={() => setModoEdicion(true)} className="btn-editar">
                                    Editar Perfil
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Seccion de Cursos Aprobados */}
            <div className="cursos-aprobados-section">
                <button 
                    className="btn-cursos"
                    onClick={() => setMostrarCursos(!mostrarCursos)}
                >
                    {mostrarCursos ? 'Ocultar Cursos Aprobados' : 'Ver Cursos Aprobados'}
                </button>
                
                {mostrarCursos && (
                    <CursosAprobados usuarioId={usuario.id_usuario} esMiPerfil={esMiPerfil} />
                )}
            </div>
        </div>
    );
};

export default Perfil;