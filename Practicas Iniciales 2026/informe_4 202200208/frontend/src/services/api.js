import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('API URL:', API_URL); 

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// SERVICIOS DE AUTENTICACION
// ============================================

export const registro = (datos) => {
    return api.post('/auth/registro', datos);
};

export const login = (datos) => {
    return api.post('/auth/login', datos);
};

export const recuperarPassword = (datos) => {
    return api.post('/auth/recuperar', datos);
};

// ============================================
// SERVICIOS DE USUARIOS
// ============================================

export const obtenerUsuarios = () => {
    return api.get('/usuarios');
};

export const obtenerUsuarioPorRegistro = (registro) => {
    return api.get(`/usuarios/${registro}`);
};

export const actualizarPerfil = (id, datos) => {
    return api.put(`/usuarios/${id}`, datos);
};

// ============================================
// SERVICIOS DE PUBLICACIONES
// ============================================

export const obtenerPublicaciones = (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.curso_id) params.append('curso_id', filtros.curso_id);
    if (filtros.catedratico_id) params.append('catedratico_id', filtros.catedratico_id);
    if (filtros.nombre_curso) params.append('nombre_curso', filtros.nombre_curso);
    if (filtros.nombre_catedratico) params.append('nombre_catedratico', filtros.nombre_catedratico);
    
    const url = params.toString() ? `/publicaciones?${params}` : '/publicaciones';
    return api.get(url);
};

export const crearPublicacion = (datos) => {
    return api.post('/publicaciones', datos);
};

// ============================================
// SERVICIOS DE COMENTARIOS
// ============================================

export const obtenerComentarios = (publicacionId) => {
    return api.get(`/publicaciones/${publicacionId}/comentarios`);
};

export const agregarComentario = (publicacionId, mensaje) => {
    return api.post(`/publicaciones/${publicacionId}/comentarios`, { mensaje });
};

// ============================================
// SERVICIOS DE CURSOS
// ============================================

export const obtenerCursos = () => {
    return api.get('/cursos');
};

export const obtenerCatedraticos = () => {
    return api.get('/catedraticos');
};

// ============================================
// SERVICIOS DE CURSOS APROBADOS
// ============================================

export const obtenerCursosAprobados = (usuarioId) => {
    return api.get(`/usuarios/${usuarioId}/cursos-aprobados`);
};

export const agregarCursoAprobado = (datos) => {
    return api.post('/cursos-aprobados', datos);
};

export default api;