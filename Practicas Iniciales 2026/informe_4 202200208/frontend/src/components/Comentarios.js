import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerComentarios, agregarComentario } from '../services/api';
import './Comentarios.css';

const Comentarios = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarComentarios();
    }, [id]);

    const cargarComentarios = async () => {
        setCargando(true);
        try {
            const response = await obtenerComentarios(id);
            setComentarios(response.data.data || []);
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        
        setEnviando(true);
        setError('');
        
        try {
            await agregarComentario(id, nuevoComentario);
            setNuevoComentario('');
            cargarComentarios();
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error);
            } else {
                setError('Error al enviar comentario');
            }
        } finally {
            setEnviando(false);
        }
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

    if (cargando) {
        return <div className="cargando">Cargando comentarios...</div>;
    }

    return (
        <div className="comentarios-container">
            <div className="comentarios-header">
                <button onClick={() => navigate(-1)} className="btn-volver">
                    ← Volver
                </button>
                <h2>Comentarios</h2>
            </div>

            <div className="lista-comentarios">
                {comentarios.length === 0 ? (
                    <p className="sin-comentarios">No hay comentarios aun. ¡Se el primero en comentar!</p>
                ) : (
                    comentarios.map(com => (
                        <div key={com.id_comentario} className="comentario-card">
                            <div className="comentario-autor">
                                <strong>{com.nombres} {com.apellidos}</strong>
                                <span className="fecha">{formatearFecha(com.fecha)}</span>
                            </div>
                            <div className="comentario-mensaje">
                                <p>{com.mensaje}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="nuevo-comentario">
                <h3>Agregar comentario</h3>
                {error && <div className="error-mensaje">{error}</div>}
                <form onSubmit={handleEnviarComentario}>
                    <textarea
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Escribe tu comentario..."
                        rows="4"
                        required
                    ></textarea>
                    <button type="submit" disabled={enviando}>
                        {enviando ? 'Enviando...' : 'Enviar comentario'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Comentarios;