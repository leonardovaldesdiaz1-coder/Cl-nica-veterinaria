const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 3000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =====================================================
// ARCHIVOS DEL FRONTEND
// =====================================================

app.use(express.static(path.join(__dirname)));


// =====================================================
// CONEXIÓN A MYSQL
// =====================================================

const pool = mysql.createPool({

    host: "localhost",

    user: "root",

    password: "Alexis212699",

    database: "clinica_veterinaria",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// =====================================================
// VERIFICAR CONEXIÓN
// =====================================================

async function verificarConexion() {

    try {

        const conexion = await pool.getConnection();

        console.log("Conexión a MySQL establecida.");

        conexion.release();

    } catch (error) {

        console.error(
            "Error al conectar con MySQL:",
            error.message
        );

    }

}

verificarConexion();


// =====================================================
// RUTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// =====================================================
// ACTIVIDAD 1
// ALTA DE CITA
// =====================================================

app.post("/api/citas", async (req, res) => {

    const {
        nombreDueno,
        nombreMascota,
        fecha,
        hora
    } = req.body;


    if (
        !nombreDueno ||
        !nombreMascota ||
        !fecha ||
        !hora
    ) {

        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios."
        });

    }


    const conexion =
        await pool.getConnection();


    try {

        await conexion.beginTransaction();


        // =================================================
        // BUSCAR PROPIETARIO
        // =================================================

        const [propietarios] =
            await conexion.execute(
                `SELECT id_propietario
                 FROM propietarios
                 WHERE nombre = ?
                 LIMIT 1`,
                [nombreDueno]
            );


        let idPropietario;


        if (propietarios.length === 0) {

            const [resultado] =
                await conexion.execute(
                    `INSERT INTO propietarios
                     (nombre)
                     VALUES (?)`,
                    [nombreDueno]
                );

            idPropietario =
                resultado.insertId;

        } else {

            idPropietario =
                propietarios[0].id_propietario;

        }


        // =================================================
        // BUSCAR MASCOTA
        // =================================================

        const [mascotas] =
            await conexion.execute(
                `SELECT id_mascota
                 FROM mascotas
                 WHERE nombre = ?
                 AND id_propietario = ?
                 LIMIT 1`,
                [
                    nombreMascota,
                    idPropietario
                ]
            );


        let idMascota;


        if (mascotas.length === 0) {

            const [resultado] =
                await conexion.execute(
                    `INSERT INTO mascotas
                     (
                        id_propietario,
                        nombre,
                        especie,
                        sexo
                     )
                     VALUES
                     (?, ?, 'No especificado',
                     'No especificado')`,
                    [
                        idPropietario,
                        nombreMascota
                    ]
                );

            idMascota =
                resultado.insertId;

        } else {

            idMascota =
                mascotas[0].id_mascota;

        }


        // =================================================
        // SERVICIO POR DEFECTO
        // =================================================

        const [servicios] =
            await conexion.execute(
                `SELECT id_servicio
                 FROM servicios
                 WHERE nombre = 'Consulta general'
                 LIMIT 1`
            );


        if (servicios.length === 0) {

            throw new Error(
                "No existe el servicio Consulta general."
            );

        }


        const idServicio =
            servicios[0].id_servicio;


        // =================================================
        // VERIFICAR HORARIO
        // =================================================

        const [horarios] =
            await conexion.execute(
                `SELECT id_cita
                 FROM citas
                 WHERE fecha = ?
                 AND hora = ?
                 AND estado <> 'Cancelada'
                 LIMIT 1`,
                [
                    fecha,
                    hora
                ]
            );


        if (horarios.length > 0) {

            await conexion.rollback();

            return res.status(409).json({
                mensaje:
                    "Ya existe una cita registrada en esa fecha y hora."
            });

        }


        // =================================================
        // INSERTAR CITA
        // =================================================

        const [resultadoCita] =
            await conexion.execute(
                `INSERT INTO citas
                 (
                    id_mascota,
                    id_servicio,
                    fecha,
                    hora,
                    estado
                 )
                 VALUES
                 (?, ?, ?, ?, 'Pendiente')`,
                [
                    idMascota,
                    idServicio,
                    fecha,
                    hora
                ]
            );


        await conexion.commit();


        res.status(201).json({

            mensaje:
                "Cita registrada correctamente.",

            idCita:
                resultadoCita.insertId

        });


    } catch (error) {

        await conexion.rollback();

        console.error(
            "Error al registrar cita:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al registrar la cita.",

            error:
                error.message

        });


    } finally {

        conexion.release();

    }

});


// =====================================================
// ACTIVIDAD 2
// CONSULTAR TODAS LAS CITAS
// =====================================================

app.get("/api/citas", async (req, res) => {

    try {

        const [citas] =
            await pool.execute(`

                SELECT

                    c.id_cita,

                    m.nombre AS mascota,

                    p.nombre AS propietario,

                    s.nombre AS servicio,

                    c.fecha,

                    c.hora,

                    c.estado,

                    c.observaciones

                FROM citas c

                INNER JOIN mascotas m
                    ON c.id_mascota =
                       m.id_mascota

                INNER JOIN propietarios p
                    ON m.id_propietario =
                       p.id_propietario

                INNER JOIN servicios s
                    ON c.id_servicio =
                       s.id_servicio

                ORDER BY
                    c.fecha ASC,
                    c.hora ASC

            `);


        res.json(citas);


    } catch (error) {

        console.error(
            "Error al consultar citas:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al consultar las citas.",

            error:
                error.message

        });

    }

});


// =====================================================
// ACTIVIDAD 3
// REPROGRAMAR CITA
// =====================================================

app.put("/api/citas/:id", async (req, res) => {

    const { id } =
        req.params;

    const {
        fecha,
        hora
    } = req.body;


    if (!fecha || !hora) {

        return res.status(400).json({

            mensaje:
                "La fecha y la hora son obligatorias."

        });

    }


    try {

        // =================================================
        // VERIFICAR DISPONIBILIDAD
        // =================================================

        const [horarios] =
            await pool.execute(
                `SELECT id_cita
                 FROM citas
                 WHERE fecha = ?
                 AND hora = ?
                 AND id_cita <> ?
                 AND estado <> 'Cancelada'
                 LIMIT 1`,
                [
                    fecha,
                    hora,
                    id
                ]
            );


        if (horarios.length > 0) {

            return res.status(409).json({

                mensaje:
                    "Ya existe otra cita en esa fecha y hora."

            });

        }


        // =================================================
        // ACTUALIZAR
        // =================================================

        const [resultado] =
            await pool.execute(
                `UPDATE citas
                 SET fecha = ?,
                     hora = ?
                 WHERE id_cita = ?`,
                [
                    fecha,
                    hora,
                    id
                ]
            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({

                mensaje:
                    "La cita no existe."

            });

        }


        res.json({

            mensaje:
                "La cita ha sido reprogramada correctamente."

        });


    } catch (error) {

        console.error(
            "Error al reprogramar:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al reprogramar la cita.",

            error:
                error.message

        });

    }

});


// =====================================================
// ACTIVIDAD 3
// ELIMINAR / CANCELAR CITA
// =====================================================

app.delete("/api/citas/:id", async (req, res) => {

    const { id } =
        req.params;


    try {

        const [resultado] =
            await pool.execute(
                `DELETE FROM citas
                 WHERE id_cita = ?`,
                [id]
            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({

                mensaje:
                    "La cita no existe."

            });

        }


        res.json({

            mensaje:
                "La cita ha sido cancelada correctamente."

        });


    } catch (error) {

        console.error(
            "Error al cancelar:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al cancelar la cita.",

            error:
                error.message

        });

    }

});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Servidor iniciado en http://localhost:${PORT}`
    );

});