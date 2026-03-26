import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearPublicacion, obtenerCursos, obtenerCatedraticos } from '../services/api';
import './Formularios.css';

const CrearPublicacion = () => {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState([]);
    const [catedraticos, setCatedraticos] = useState([]);
    const [formData, setFormData] = useState({
        tipo: 'catedratico',
        entidad_id: '',
        mensaje: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

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
        } finally {
            setCargandoDatos(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.entidad_id) {
            setError('Debe seleccionar un curso o catedratico');
            return;
        }
        
        if (!formData.mensaje.trim()) {
            setError('El mensaje no puede estar vacio');
            return;
        }
        
        setError('');
        setCargando(true);
        
        try {
            await crearPublicacion(formData);
            navigate('/');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.error);
            } else {
                setError('Error al crear la publicacion');
            }
        } finally {
            setCargando(false);
        }
    };

    if (cargandoDatos) {
        return <div className="cargando">Cargando datos...</div>;
    }

    return (
        <div className="formulario-container">
            <h2>Crear Publicacion</h2>
            <form onSubmit={handleSubmit} className="formulario">
                {error && <div className="error-mensaje">{error}</div>}

                <div className="campo">
                    <label>Tipo de publicacion:</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="catedratico">Catedratico</option>
                        <option value="curso">Curso</option>
                    </select>
                </div>

                <div className="campo">
                    <label>
                        {formData.tipo === 'curso' ? 'Seleccionar curso:' : 'Seleccionar catedratico:'}
                    </label>
                    <select name="entidad_id" value={formData.entidad_id} onChange={handleChange}>
                        <option value="">-- Seleccionar --</option>
                        {formData.tipo === 'curso' ? (
                            cursos.map(curso => (
                                <option key={curso.id_curso} value={curso.id_curso}>
                                    {curso.codigo_curso} - {curso.nombre_curso}
                                </option>
                            ))
                        ) : (
                            catedraticos.map(cat => (
                                <option key={cat.id_catedratico} value={cat.id_catedratico}>
                                    {cat.nombres} {cat.apellidos}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="campo">
                    <label>Mensaje:</label>
                    <textarea
                        name="mensaje"
                        rows="6"
                        value={formData.mensaje}
                        onChange={handleChange}
                        placeholder="Escribe tu opinion sobre el curso o catedratico..."
                        required
                    ></textarea>
                </div>

                <div className="botones">
                    <button type="button" onClick={() => navigate('/')} className="btn-cancelar">
                        Cancelar
                    </button>
                    <button type="submit" disabled={cargando}>
                        {cargando ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CrearPublicacion;