// Guardar token en localStorage
export const guardarToken = (token) => {
    localStorage.setItem('token', token);
};

// Obtener token
export const obtenerToken = () => {
    return localStorage.getItem('token');
};

// Eliminar token (logout)
export const eliminarToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

// Guardar datos del usuario
export const guardarUsuario = (usuario) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
};

// Obtener usuario actual
export const obtenerUsuarioActual = () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
};

// Verificar si esta autenticado
export const estaAutenticado = () => {
    return localStorage.getItem('token') !== null;
};