-- Crear base de datos
CREATE DATABASE IF NOT EXISTS calificaciones_ecys;
USE calificaciones_ecys;

-- =============================================
-- TABLA: Usuario
-- =============================================
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    registro_academico VARCHAR(30) UNIQUE NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,  -- Para hash de contraseña
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: Catedratico
-- =============================================
CREATE TABLE Catedratico (
    id_catedratico INT PRIMARY KEY AUTO_INCREMENT,
    codigo_catedratico VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    correo VARCHAR(100)
);

-- =============================================
-- TABLA: Curso
-- =============================================
CREATE TABLE Curso (
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    codigo_curso VARCHAR(20) UNIQUE NOT NULL,
    nombre_curso VARCHAR(100) NOT NULL,
    creditos INT,
    area VARCHAR(50)
);

-- =============================================
-- TABLA: Publicacion
-- =============================================
CREATE TABLE Publicacion (
    id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    tipo ENUM('catedratico', 'curso') NOT NULL,
    entidad_id INT NOT NULL,  -- Puede ser id_catedratico o id_curso
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- =============================================
-- TABLA: Comentario
-- =============================================
CREATE TABLE Comentario (
    id_comentario INT PRIMARY KEY AUTO_INCREMENT,
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- =============================================
-- TABLA: Curso_Aprobado
-- =============================================
CREATE TABLE Curso_Aprobado (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_aprobacion DATE,
    nota DECIMAL(4,2),
    UNIQUE KEY unique_usuario_curso (id_usuario, id_curso),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE
);

-- =============================================
-- INSERTAR DATOS INICIALES
-- =============================================

-- Insertar cursos del área de sistemas
INSERT INTO Curso (codigo_curso, nombre_curso, creditos, area) VALUES
('770', 'Prácticas Iniciales', 3, 'Ciencias de la Computación'),
('771', 'Estructuras de Datos', 5, 'Ciencias de la Computación'),
('772', 'Matemática de Computo', 4, 'Matemática Aplicada'),
('773', 'Arquitectura de Computadoras', 4, 'Ciencias de la Computación'),
('774', 'Sistemas Operativos 1', 5, 'Ciencias de la Computación'),
('775', 'Redes de Computadoras 1', 4, 'Ciencias de la Computación'),
('776', 'Bases de Datos 1', 5, 'Ciencias de la Computación'),
('777', 'Análisis y Diseño de Sistemas 1', 4, 'Ingeniería de Software');

-- Insertar catedráticos
INSERT INTO Catedratico (codigo_catedratico, nombres, apellidos, correo) VALUES
('CAT001', 'Floriza', 'Avila', 'floriza.avila@ingenieria.usac.edu.gt'),
('CAT002', 'Luis', 'Espino', 'luis.espino@ingenieria.usac.edu.gt'),
('CAT003', 'Otto', 'Castellanos', 'otto.castellanos@ingenieria.usac.edu.gt');

-- Insertar usuario de prueba (contraseña: '123456' - luego se encriptará)
INSERT INTO Usuario (registro_academico, nombres, apellidos, correo, contraseña) VALUES
('202300001', 'Juan', 'Pérez', 'juan.perez@estudiante.usac.edu.gt', '123456');

-- Insertar algunas publicaciones de ejemplo
INSERT INTO Publicacion (id_usuario, tipo, entidad_id, mensaje) VALUES
(1, 'catedratico', 1, 'Excelente catedrático, explica muy bien los temas de bases de datos'),
(1, 'catedratico', 2, 'Buen profesor, pero sus exámenes son difíciles'),
(1, 'curso', 1, 'El curso de Prácticas Iniciales es fundamental para empezar');

-- Insertar comentarios
INSERT INTO Comentario (id_publicacion, id_usuario, mensaje) VALUES
(1, 1, 'Totalmente de acuerdo, muy buen catedrático'),
(2, 1, 'Sí, pero se aprende mucho con él');

-- Insertar cursos aprobados
INSERT INTO Curso_Aprobado (id_usuario, id_curso, fecha_aprobacion, nota) VALUES
(1, 1, '2025-11-15', 85.5),
(1, 2, '2025-11-20', 90.0);

-- =============================================
-- CONSULTAS REQUERIDAS
-- =============================================

-- 1. Ver todas las publicaciones con información de usuario y entidad
SELECT 
    p.id_publicacion,
    u.nombres AS usuario_nombre,
    u.apellidos AS usuario_apellido,
    p.tipo,
    CASE 
        WHEN p.tipo = 'catedratico' THEN c.nombres
        WHEN p.tipo = 'curso' THEN cu.nombre_curso
    END AS entidad_nombre,
    p.mensaje,
    p.fecha
FROM Publicacion p
JOIN Usuario u ON p.id_usuario = u.id_usuario
LEFT JOIN Catedratico c ON p.tipo = 'catedratico' AND p.entidad_id = c.id_catedratico
LEFT JOIN Curso cu ON p.tipo = 'curso' AND p.entidad_id = cu.id_curso
ORDER BY p.fecha DESC;

-- 2. Ver cursos aprobados por usuario con total de créditos
SELECT 
    u.nombres,
    u.apellidos,
    GROUP_CONCAT(c.nombre_curso) AS cursos_aprobados,
    COUNT(c.id_curso) AS total_cursos,
    SUM(c.creditos) AS total_creditos
FROM Usuario u
LEFT JOIN Curso_Aprobado ca ON u.id_usuario = ca.id_usuario
LEFT JOIN Curso c ON ca.id_curso = c.id_curso
GROUP BY u.id_usuario;

-- 3. Buscar publicaciones por catedrático
SELECT 
    p.*,
    u.nombres AS usuario_nombre,
    cat.nombres AS catedratico_nombre
FROM Publicacion p
JOIN Usuario u ON p.id_usuario = u.id_usuario
JOIN Catedratico cat ON p.entidad_id = cat.id_catedratico
WHERE p.tipo = 'catedratico' AND cat.nombres LIKE '%Avila%'
ORDER BY p.fecha DESC;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para publicaciones con todos los detalles
CREATE VIEW vista_publicaciones_completas AS
SELECT 
    p.id_publicacion,
    p.mensaje,
    p.fecha,
    u.id_usuario,
    u.nombres AS usuario_nombres,
    u.apellidos AS usuario_apellidos,
    p.tipo,
    CASE 
        WHEN p.tipo = 'catedratico' THEN cat.nombres
        WHEN p.tipo = 'curso' THEN cu.nombre_curso
    END AS entidad_nombre,
    CASE 
        WHEN p.tipo = 'catedratico' THEN cat.apellidos
        ELSE NULL
    END AS entidad_apellidos,
    COUNT(com.id_comentario) AS total_comentarios
FROM Publicacion p
JOIN Usuario u ON p.id_usuario = u.id_usuario
LEFT JOIN Catedratico cat ON p.tipo = 'catedratico' AND p.entidad_id = cat.id_catedratico
LEFT JOIN Curso cu ON p.tipo = 'curso' AND p.entidad_id = cu.id_curso
LEFT JOIN Comentario com ON p.id_publicacion = com.id_publicacion
GROUP BY p.id_publicacion;