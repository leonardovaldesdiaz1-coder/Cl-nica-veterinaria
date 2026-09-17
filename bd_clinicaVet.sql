CREATE DATABASE IF NOT EXISTS clinica_veterinaria
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE clinica_veterinaria;


-- =====================================================
-- PROPIETARIOS
-- =====================================================

CREATE TABLE propietarios (
    id_propietario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- MASCOTAS
-- =====================================================

CREATE TABLE mascotas (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL DEFAULT 'No especificado',
    raza VARCHAR(100),
    edad INT,
    sexo ENUM('Macho', 'Hembra', 'No especificado')
        DEFAULT 'No especificado',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mascota_propietario
        FOREIGN KEY (id_propietario)
        REFERENCES propietarios(id_propietario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =====================================================
-- SERVICIOS
-- =====================================================

CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE
);


-- =====================================================
-- CITAS
-- =====================================================

CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,

    estado ENUM(
        'Pendiente',
        'Confirmada',
        'En recepción',
        'Atendida',
        'Cancelada'
    ) DEFAULT 'Pendiente',

    observaciones VARCHAR(500),

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cita_mascota
        FOREIGN KEY (id_mascota)
        REFERENCES mascotas(id_mascota)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_cita_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =====================================================
-- SERVICIOS INICIALES
-- =====================================================

INSERT INTO servicios
(nombre, descripcion, precio)
VALUES
('Consulta general',
 'Consulta médica general para mascotas',
 350.00),

('Vacunación',
 'Aplicación de vacunas',
 250.00),

('Revisión',
 'Revisión general de la mascota',
 300.00),

('Peluquería',
 'Servicio de baño y estética',
 400.00),

('Desparasitación',
 'Desparasitación interna y externa',
 200.00);