const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// CONEXIÓN A MySQL 
// ============================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',           // ← 
    password: '41777544Em',       // 
    database: 'calificaciones_ecys',  // ← 
    waitForConnections: true,
    connectionLimit: 10
});

// Verificar conexión a MySQL
db.getConnection((err, connection) => {
    if (err) {
        console.error(' Error conectando a MySQL:', err);
        return;
    }
    console.log(' Conectado a MySQL');
    connection.release();
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API funcionando correctamente',
        version: '1.0.0',
        estado: 'activo'
    });
});

// ============================================
// ENDPOINTS PARA POSTMAN 
// ============================================

// GET: Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id_usuario, registro_academico, nombres, apellidos, correo FROM Usuario', 
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

// POST: Crear nuevo usuario 
app.post('/api/usuarios', (req, res) => {
    const { registro_academico, nombres, apellidos, correo, contraseña } = req.body;
    
    if (!registro_academico || !nombres || !apellidos || !correo || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    db.query(
        'INSERT INTO Usuario (registro_academico, nombres, apellidos, correo, contraseña) VALUES (?, ?, ?, ?, ?)',
        [registro_academico, nombres, apellidos, correo, contraseña],
        (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El registro o correo ya existe' });
                }
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                id: result.insertId
            });
        }
    );
});

// GET: Obtener todas las publicaciones
app.get('/api/publicaciones', (req, res) => {
    const query = `
        SELECT p.*, u.nombres, u.apellidos 
        FROM Publicacion p
        JOIN Usuario u ON p.id_usuario = u.id_usuario
        ORDER BY p.fecha DESC
    `;
    
    db.query(query, (err, results) => {
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

// GET: Obtener todos los cursos
app.get('/api/cursos', (req, res) => {
    db.query('SELECT * FROM Curso', (err, results) => {
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

// GET: Obtener todos los catedráticos
app.get('/api/catedraticos', (req, res) => {
    db.query('SELECT * FROM Catedratico', (err, results) => {
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
// INICIAR SERVIDOR
// ============================================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Endpoints disponibles:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/api/usuarios`);
    console.log(`   POST http://localhost:${PORT}/api/usuarios`);
    console.log(`   GET  http://localhost:${PORT}/api/publicaciones`);
    console.log(`   GET  http://localhost:${PORT}/api/cursos`);
    console.log(`   GET  http://localhost:${PORT}/api/catedraticos`);
});