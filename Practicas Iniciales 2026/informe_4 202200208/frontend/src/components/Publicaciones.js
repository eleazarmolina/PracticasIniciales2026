import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerPublicaciones, obtenerCursos, obtenerCatedraticos } from '../services/api';
import './Publicaciones.css';

const Publicaciones = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [catedraticos, setCatedraticos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtros, setFiltros] = useState({
        tipo: '',
        curso_id: '',
        catedratico_id: '',
        nombre_curso: '',
        nombre_catedratico: ''
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        cargarPublicaciones();
    }, [filtros]);

    const cargarDatos = async () => {
        try {
            const [cursosRes, catedraticosRes] = await Promise.all([
                obtenerCursos(),
                obtenerCatedraticos()
            ]);
            setCursos(cursosRes.data.data || []);
            setCatedraticos(catedraticosRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    const cargarPublicaciones = async () => {
        setCargando(true);
        try {
            const filtrosActivos = {};
            if (filtros.tipo) filtrosActivos.tipo = filtros.tipo;
            if (filtros.curso_id) filtrosActivos.curso_id = filtros.curso_id;
            if (filtros.catedratico_id) filtrosActivos.catedratico_id = filtros.catedratico_id;
            if (filtros.nombre_curso) filtrosActivos.nombre_curso = filtros.nombre_curso;
            if (filtros.nombre_catedratico) filtrosActivos.nombre_catedratico = filtros.nombre_catedratico;
            
            const response = await obtenerPublicaciones(filtrosActivos);
            setPublicaciones(response.data.data || []);
        } catch (error) {
            console.error('Error cargando publicaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value
        });
    };

    const limpiarFiltros = () => {
        setFiltros({
            tipo: '',
            curso_id: '',
            catedratico_id: '',
            nombre_curso: '',
            nombre_catedratico: ''
        });
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (cargando && publicaciones.length === 0) {
        return <div className="cargando">Cargando publicaciones...</div>;
    }

    return (
        <div className="publicaciones-container">
            <div className="header-publicaciones">
                <h1>Publicaciones</h1>
                <Link to="/crear-publicacion" className="btn-crear">
                    + Crear Publicacion
                </Link>
            </div>

            <button 
                className="btn-filtros"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>

            {mostrarFiltros && (
                <div className="filtros-container">
                    <div className="filtro-grupo">
                        <label>Filtrar por tipo:</label>
                        <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange}>
                            <option value="">Todos</option>
                            <option value="curso">Curso</option>
                            <option value="catedratico">Catedratico</option>
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Filtrar por curso:</label>
                        <select name="curso_id" value={filtros.curso_id} onChange={handleFiltroChange}>
                            <option value="">Seleccionar curso</option>
                            {cursos.map(curso => (
                                <option key={curso.id_curso} value={curso.id_curso}>
                                    {curso.codigo_curso} - {curso.nombre_curso}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Filtrar por catedratico:</label>
                        <select name="catedratico_id" value={filtros.catedratico_id} onChange={handleFiltroChange}>
                            <option value="">Seleccionar catedratico</option>
                            {catedraticos.map(cat => (
                                <option key={cat.id_catedratico} value={cat.id_catedratico}>
                                    {cat.nombres} {cat.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Nombre del curso:</label>
                        <input
                            type="text"
                            name="nombre_curso"
                            placeholder="Buscar por nombre"
                            value={filtros.nombre_curso}
                            onChange={handleFiltroChange}
                        />
                    </div>

                    <div className="filtro-grupo">
                        <label>Nombre del catedratico:</label>
                        <input
                            type="text"
                            name="nombre_catedratico"
                            placeholder="Buscar por nombre"
                            value={filtros.nombre_catedratico}
                            onChange={handleFiltroChange}
                        />
                    </div>

                    <button onClick={limpiarFiltros} className="btn-limpiar">
                        Limpiar Filtros
                    </button>
                </div>
            )}

            <div className="lista-publicaciones">
                {publicaciones.length === 0 ? (
                    <p className="no-publicaciones">No hay publicaciones. ¡Se el primero en crear una!</p>
                ) : (
                    publicaciones.map(pub => (
                        <div key={pub.id_publicacion} className="publicacion-card">
                            <div className="publicacion-header">
                                <div className="publicacion-autor">
                                    <strong>{pub.usuario_nombres} {pub.usuario_apellidos}</strong>
                                    <span className="fecha">{formatearFecha(pub.fecha)}</span>
                                </div>
                                <div className="publicacion-tipo">
                                    <span className={`badge ${pub.tipo}`}>
                                        {pub.tipo === 'curso' ? 'Curso' : 'Catedratico'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="publicacion-entidad">
                                <h3>{pub.entidad_nombre} {pub.entidad_apellidos || ''}</h3>
                            </div>
                            
                            <div className="publicacion-mensaje">
                                <p>{pub.mensaje}</p>
                            </div>
                            
                            <div className="publicacion-footer">
                                <Link 
                                    to={`/publicaciones/${pub.id_publicacion}/comentarios`}
                                    className="btn-comentarios"
                                >
                                    Ver comentarios ({pub.total_comentarios || 0})
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Publicaciones;