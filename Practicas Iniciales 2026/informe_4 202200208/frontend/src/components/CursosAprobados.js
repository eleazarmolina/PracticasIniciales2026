import React, { useState, useEffect } from 'react';
import { obtenerCursos, obtenerCursosAprobados, agregarCursoAprobado } from '../services/api';
import { obtenerUsuarioActual } from '../utils/auth';
import './CursosAprobados.css';

const CursosAprobados = ({ usuarioId, esMiPerfil = false }) => {
    const [cursosAprobados, setCursosAprobados] = useState([]);
    const [todosCursos, setTodosCursos] = useState([]);
    const [totalCreditos, setTotalCreditos] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [nota, setNota] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [enviando, setEnviando] = useState(false);

    const usuarioActual = obtenerUsuarioActual();
    const esPropio = esMiPerfil || (usuarioActual && usuarioActual.id === usuarioId);

    useEffect(() => {
        cargarDatos();
    }, [usuarioId]);

    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        try {
            const [aprobadosRes, cursosRes] = await Promise.all([
                obtenerCursosAprobados(usuarioId),
                obtenerCursos()
            ]);
            
            const cursosAprobadosData = aprobadosRes.data?.data?.cursos || [];
            setCursosAprobados(cursosAprobadosData);
            setTotalCreditos(aprobadosRes.data?.data?.total_creditos || 0);
            
            const todosCursosData = cursosRes.data?.data || [];
            const idsAprobados = cursosAprobadosData.map(c => c.id_curso);
            const cursosNoAprobados = todosCursosData.filter(c => !idsAprobados.includes(c.id_curso));
            setTodosCursos(cursosNoAprobados);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.response?.data?.error || 'Error al cargar datos');
        } finally {
            setCargando(false);
        }
    };

    const handleAgregarCurso = async (e) => {
        e.preventDefault();
        if (!cursoSeleccionado) {
            setError('Debe seleccionar un curso');
            return;
        }
        
        setEnviando(true);
        setError('');
        setExito('');
        
        try {
            await agregarCursoAprobado({
                curso_id: cursoSeleccionado,
                nota: nota || null
            });
            setExito('Curso agregado exitosamente');
            setCursoSeleccionado('');
            setNota('');
            setMostrarFormulario(false);
            cargarDatos();
            
            setTimeout(() => setExito(''), 3000);
        } catch (error) {
            console.error('Error al agregar curso:', error);
            setError(error.response?.data?.error || 'Error al agregar curso');
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return <div className="cargando">Cargando cursos aprobados...</div>;
    }

    return (
        <div className="cursos-aprobados">
            <div className="cursos-header">
                <h3>Cursos Aprobados</h3>
                <div className="total-creditos">
                    Total de creditos: <strong>{totalCreditos}</strong>
                </div>
            </div>

            {error && (
                <div className="error-mensaje" style={{ marginBottom: '15px' }}>
                    {error}
                    <button onClick={cargarDatos} style={{ marginLeft: '10px', padding: '4px 12px' }}>
                        Reintentar
                    </button>
                </div>
            )}

            {cursosAprobados.length === 0 ? (
                <p className="sin-cursos">No hay cursos aprobados registrados</p>
            ) : (
                <div className="lista-cursos">
                    <table className="tabla-cursos">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Curso</th>
                                <th>Creditos</th>
                                <th>Fecha</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursosAprobados.map(curso => (
                                <tr key={curso.id_curso}>
                                    <td>{curso.codigo_curso}</td>
                                    <td>{curso.nombre_curso}</td>
                                    <td>{curso.creditos}</td>
                                    <td>{curso.fecha_aprobacion ? new Date(curso.fecha_aprobacion).toLocaleDateString('es-GT') : '-'}</td>
                                    <td>{curso.nota || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {esPropio && !mostrarFormulario && (
                <button onClick={() => setMostrarFormulario(true)} className="btn-agregar-curso">
                    + Agregar Curso Aprobado
                </button>
            )}

            {mostrarFormulario && (
                <form onSubmit={handleAgregarCurso} className="form-agregar-curso">
                    <h4>Agregar curso aprobado</h4>
                    
                    <div className="campo">
                        <label>Curso:</label>
                        <select 
                            value={cursoSeleccionado} 
                            onChange={(e) => setCursoSeleccionado(e.target.value)}
                            required
                        >
                            <option value="">-- Seleccionar curso --</option>
                            {todosCursos.map(curso => (
                                <option key={curso.id_curso} value={curso.id_curso}>
                                    {curso.codigo_curso} - {curso.nombre_curso} ({curso.creditos} creditos)
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="campo">
                        <label>Nota (opcional):</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Ej: 85.5"
                        />
                    </div>
                    
                    <div className="botones-form">
                        <button type="button" onClick={() => setMostrarFormulario(false)} className="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" disabled={enviando}>
                            {enviando ? 'Agregando...' : 'Agregar Curso'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CursosAprobados;