console.log('Iniciando servidor...');

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuracion de la conexion a MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '41777544Em',
    database: 'calificaciones_ecys',
    waitForConnections: true,
    connectionLimit: 10
});

// Verificar conexion a la base de datos
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conexion a MySQL establecida correctamente');
    connection.release();
});

// Clave secreta para JWT
const JWT_SECRET = 'clave_secreta_del_proyecto_2026';
const JWT_EXPIRE = '24h';

// Middleware para verificar token en rutas protegidas
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token de autenticacion requerido' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalido o expirado' });
        }
        req.usuario = decoded;
        next();
    });
};

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Calificacion de Catedraticos',
        version: '1.0.0',
        estado: 'funcionando'
    });
});

// ============================================
// ENDPOINTS DE AUTENTICACION
// ============================================

// Registro de nuevo usuario
app.post('/api/auth/registro', async (req, res) => {
    const { registro_academico, nombres, apellidos, correo, contraseña } = req.body;
    
    if (!registro_academico || !nombres || !apellidos || !correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);
        
        db.query(
            'INSERT INTO Usuario (registro_academico, nombres, apellidos, correo, contraseña) VALUES (?, ?, ?, ?, ?)',
            [registro_academico, nombres, apellidos, correo, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'El registro academico o correo ya existe' });
                    }
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                
                const token = jwt.sign(
                    { id: result.insertId, registro: registro_academico },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRE }
                );
                
                res.status(201).json({
                    success: true,
                    message: 'Usuario registrado exitosamente',
                    token: token,
                    usuario: {
                        id: result.insertId,
                        nombres: nombres,
                        apellidos: apellidos,
                        correo: correo
                    }
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Inicio de sesion
app.post('/api/auth/login', (req, res) => {
    const { registro_academico, contraseña } = req.body;
    
    if (!registro_academico || !contraseña) {
        return res.status(400).json({ error: 'Registro academico y contraseña son requeridos' });
    }
    
    db.query(
        'SELECT * FROM Usuario WHERE registro_academico = ?',
        [registro_academico],
        async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ error: 'Usuario no encontrado' });
            }
            
            const usuario = results[0];
            const validPassword = await bcrypt.compare(contraseña, usuario.contraseña);
            
            if (!validPassword) {
                return res.status(400).json({ error: 'Contraseña incorrecta' });
            }
            
            const token = jwt.sign(
                { id: usuario.id_usuario, registro: usuario.registro_academico },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRE }
            );
            
            db.query('UPDATE Usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?', [usuario.id_usuario]);
            
            res.json({
                success: true,
                message: 'Login exitoso',
                token: token,
                usuario: {
                    id: usuario.id_usuario,
                    registro_academico: usuario.registro_academico,
                    nombres: usuario.nombres,
                    apellidos: usuario.apellidos,
                    correo: usuario.correo
                }
            });
        }
    );
});

// Recuperar contraseña
app.post('/api/auth/recuperar', async (req, res) => {
    const { registro_academico, correo, nueva_contraseña } = req.body;
    
    if (!registro_academico || !correo || !nueva_contraseña) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    try {
        db.query(
            'SELECT * FROM Usuario WHERE registro_academico = ? AND correo = ?',
            [registro_academico, correo],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                
                if (results.length === 0) {
                    return res.status(400).json({ error: 'Los datos no coinciden con ningun usuario' });
                }
                
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(nueva_contraseña, salt);
                
                db.query(
                    'UPDATE Usuario SET contraseña = ? WHERE registro_academico = ? AND correo = ?',
                    [hashedPassword, registro_academico, correo],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Error al actualizar contraseña' });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Contraseña actualizada exitosamente'
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============================================
// ENDPOINTS PUBLICOS
// ============================================

// Obtener lista de cursos
app.get('/api/cursos', (req, res) => {
    db.query('SELECT * FROM Curso ORDER BY codigo_curso', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Obtener lista de catedraticos
app.get('/api/catedraticos', (req, res) => {
    db.query('SELECT * FROM Catedratico ORDER BY apellidos', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// ============================================
// ENDPOINTS PROTEGIDOS
// ============================================

// Obtener todos los usuarios
app.get('/api/usuarios', verificarToken, (req, res) => {
    db.query(
        'SELECT id_usuario, registro_academico, nombres, apellidos, correo, fecha_registro FROM Usuario',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.json({
                success: true,
                data: results
            });
        }
    );
});

// Buscar usuario por registro academico
app.get('/api/usuarios/:registro', verificarToken, (req, res) => {
    const { registro } = req.params;
    
    db.query(
        'SELECT id_usuario, registro_academico, nombres, apellidos, correo, fecha_registro FROM Usuario WHERE registro_academico = ?',
        [registro],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json({
                success: true,
                data: results[0]
            });
        }
    );
});

// Actualizar perfil de usuario
app.put('/api/usuarios/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { nombres, apellidos, correo } = req.body;
    
    if (req.usuario.id != id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este perfil' });
    }
    
    db.query(
        'UPDATE Usuario SET nombres = ?, apellidos = ?, correo = ? WHERE id_usuario = ?',
        [nombres, apellidos, correo, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            res.json({
                success: true,
                message: 'Perfil actualizado correctamente'
            });
        }
    );
});

// Obtener publicaciones con filtros
app.get('/api/publicaciones', verificarToken, (req, res) => {
    const { tipo, nombre_curso, nombre_catedratico, curso_id, catedratico_id } = req.query;
    
    let query = `
        SELECT p.*, 
               u.nombres as usuario_nombres,
               u.apellidos as usuario_apellidos,
               CASE 
                   WHEN p.tipo = 'curso' THEN c.nombre_curso
                   WHEN p.tipo = 'catedratico' THEN cat.nombres
               END as entidad_nombre,
               CASE 
                   WHEN p.tipo = 'catedratico' THEN cat.apellidos
                   ELSE NULL
               END as entidad_apellidos,
               (SELECT COUNT(*) FROM Comentario WHERE id_publicacion = p.id_publicacion) as total_comentarios
        FROM Publicacion p
        JOIN Usuario u ON p.id_usuario = u.id_usuario
        LEFT JOIN Curso c ON p.tipo = 'curso' AND p.entidad_id = c.id_curso
        LEFT JOIN Catedratico cat ON p.tipo = 'catedratico' AND p.entidad_id = cat.id_catedratico
        WHERE 1=1
    `;
    
    const params = [];
    
    if (tipo) {
        query += ' AND p.tipo = ?';
        params.push(tipo);
    }
    
    if (curso_id) {
        query += ' AND p.tipo = "curso" AND p.entidad_id = ?';
        params.push(curso_id);
    }
    
    if (catedratico_id) {
        query += ' AND p.tipo = "catedratico" AND p.entidad_id = ?';
        params.push(catedratico_id);
    }
    
    if (nombre_curso) {
        query += ' AND c.nombre_curso LIKE ?';
        params.push(`%${nombre_curso}%`);
    }
    
    if (nombre_catedratico) {
        query += ' AND (cat.nombres LIKE ? OR cat.apellidos LIKE ?)';
        params.push(`%${nombre_catedratico}%`, `%${nombre_catedratico}%`);
    }
    
    query += ' ORDER BY p.fecha DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Crear nueva publicacion
app.post('/api/publicaciones', verificarToken, (req, res) => {
    const { tipo, entidad_id, mensaje } = req.body;
    const usuario_id = req.usuario.id;
    
    if (!tipo || !entidad_id || !mensaje) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (tipo !== 'curso' && tipo !== 'catedratico') {
        return res.status(400).json({ error: 'El tipo debe ser "curso" o "catedratico"' });
    }
    
    db.query(
        'INSERT INTO Publicacion (id_usuario, tipo, entidad_id, mensaje) VALUES (?, ?, ?, ?)',
        [usuario_id, tipo, entidad_id, mensaje],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            res.status(201).json({
                success: true,
                message: 'Publicacion creada exitosamente',
                id: result.insertId
            });
        }
    );
});

// Obtener comentarios de una publicacion
app.get('/api/publicaciones/:id/comentarios', verificarToken, (req, res) => {
    const { id } = req.params;
    
    db.query(
        `SELECT c.*, u.nombres, u.apellidos 
         FROM Comentario c
         JOIN Usuario u ON c.id_usuario = u.id_usuario
         WHERE c.id_publicacion = ?
         ORDER BY c.fecha`,
        [id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            res.json({
                success: true,
                data: results
            });
        }
    );
});

// Agregar comentario a una publicacion
app.post('/api/publicaciones/:id/comentarios', verificarToken, (req, res) => {
    const { id } = req.params;
    const { mensaje } = req.body;
    const usuario_id = req.usuario.id;
    
    if (!mensaje) {
        return res.status(400).json({ error: 'El mensaje es requerido' });
    }
    
    db.query('SELECT * FROM Publicacion WHERE id_publicacion = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }
        
        db.query(
            'INSERT INTO Comentario (id_publicacion, id_usuario, mensaje) VALUES (?, ?, ?)',
            [id, usuario_id, mensaje],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                
                res.status(201).json({
                    success: true,
                    message: 'Comentario agregado exitosamente',
                    id: result.insertId
                });
            }
        );
    });
});

// Ver cursos aprobados de un usuario
app.get('/api/usuarios/:id/cursos-aprobados', verificarToken, (req, res) => {
    const { id } = req.params;
    
    db.query(
        `SELECT c.id_curso, c.codigo_curso, c.nombre_curso, c.creditos, ca.fecha_aprobacion, ca.nota
         FROM Curso_Aprobado ca
         JOIN Curso c ON ca.id_curso = c.id_curso
         WHERE ca.id_usuario = ?
         ORDER BY ca.fecha_aprobacion DESC`,
        [id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            const total_creditos = results.reduce((sum, curso) => sum + (curso.creditos || 0), 0);
            
            res.json({
                success: true,
                data: {
                    cursos: results,
                    total_creditos: total_creditos,
                    total_cursos: results.length
                }
            });
        }
    );
});

// Agregar curso aprobado
app.post('/api/cursos-aprobados', verificarToken, (req, res) => {
    const { curso_id, nota } = req.body;
    const usuario_id = req.usuario.id;
    
    if (!curso_id) {
        return res.status(400).json({ error: 'El ID del curso es requerido' });
    }
    
    db.query('SELECT * FROM Curso WHERE id_curso = ?', [curso_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        db.query(
            'INSERT INTO Curso_Aprobado (id_usuario, id_curso, nota) VALUES (?, ?, ?)',
            [usuario_id, curso_id, nota || null],
            (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Ya has registrado este curso como aprobado' });
                    }
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                
                res.status(201).json({
                    success: true,
                    message: 'Curso aprobado registrado exitosamente'
                });
            }
        );
    });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('Servidor corriendo en http://localhost:' + PORT);
    console.log('========================================');
    console.log('Endpoints disponibles:');
    console.log('POST   /api/auth/registro');
    console.log('POST   /api/auth/login');
    console.log('POST   /api/auth/recuperar');
    console.log('GET    /api/cursos');
    console.log('GET    /api/catedraticos');
    console.log('GET    /api/usuarios (token)');
    console.log('GET    /api/usuarios/:registro (token)');
    console.log('PUT    /api/usuarios/:id (token)');
    console.log('GET    /api/publicaciones (token)');
    console.log('POST   /api/publicaciones (token)');
    console.log('GET    /api/publicaciones/:id/comentarios (token)');
    console.log('POST   /api/publicaciones/:id/comentarios (token)');
    console.log('GET    /api/usuarios/:id/cursos-aprobados (token)');
    console.log('POST   /api/cursos-aprobados (token)');
});