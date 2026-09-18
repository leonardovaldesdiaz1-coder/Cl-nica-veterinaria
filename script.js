// =====================================================
// CARGAR CITAS
// =====================================================

async function cargarCitas() {

    const lista =
        document.getElementById(
            "lista-citas"
        );


    lista.innerHTML = `
        <div class="loading">
            Cargando citas...
        </div>
    `;


    try {

        const respuesta =
            await fetch("/api/citas");


        if (!respuesta.ok) {

            throw new Error(
                "No fue posible obtener las citas."
            );

        }


        const citas =
            await respuesta.json();


        lista.innerHTML = "";


        // =================================================
        // NO HAY CITAS
        // =================================================

        if (citas.length === 0) {

            lista.innerHTML = `

                <div class="no-citas">

                    No existen citas registradas.

                </div>

            `;

            return;

        }


        // =================================================
        // CREAR CITAS
        // =================================================

        citas.forEach(
            cita => {

                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "cita";


                elemento.dataset.id =
                    cita.id_cita;


                const fecha =
                    String(cita.fecha)
                    .substring(0, 10);


                const hora =
                    String(cita.hora)
                    .substring(0, 5);


                elemento.innerHTML = `

                    <div>

                        <h3>

                            ${cita.mascota}
                            -
                            ${cita.servicio}

                        </h3>


                        <p>

                            <strong>
                                Dueño:
                            </strong>

                            ${cita.propietario}

                        </p>


                        <p>

                            <strong>
                                Fecha:
                            </strong>

                            <span class="fecha">

                                ${fecha}

                            </span>

                        </p>


                        <p>

                            <strong>
                                Hora:
                            </strong>

                            <span class="hora">

                                ${hora}

                            </span>

                        </p>


                        <p>

                            <strong>
                                Estado:
                            </strong>

                            <span class="
                                estado-texto">

                                ${cita.estado}

                            </span>

                        </p>

                    </div>


                    <div class="acciones">

                        <button

                            class="btn-reprogramar"

                            onclick="
                                reprogramarCita(
                                    ${cita.id_cita}
                                )
                            ">

                            Reprogramar

                        </button>


                        <button

                            class="btn-cancelar"

                            onclick="
                                cancelarCita(
                                    ${cita.id_cita}
                                )
                            ">

                            Cancelar

                        </button>

                    </div>

                `;


                lista.appendChild(
                    elemento
                );

            }
        );


    } catch (error) {

        console.error(error);


        lista.innerHTML = `

            <div class="error-message">

                Error al cargar las citas.

            </div>

        `;

    }

}


// =====================================================
// REPROGRAMAR
// =====================================================

async function reprogramarCita(id) {

    const cita =
        document.querySelector(
            `[data-id="${id}"]`
        );


    if (!cita) {
        return;
    }


    const fechaActual =
        cita
            .querySelector(".fecha")
            .textContent
            .trim();


    const horaActual =
        cita
            .querySelector(".hora")
            .textContent
            .trim();


    const nuevaFecha =
        prompt(
            "Ingrese la nueva fecha (AAAA-MM-DD):",
            fechaActual
        );


    if (!nuevaFecha) {
        return;
    }


    const nuevaHora =
        prompt(
            "Ingrese la nueva hora (HH:MM):",
            horaActual
        );


    if (!nuevaHora) {
        return;
    }


    // =================================================
    // VALIDAR FECHA
    // =================================================

    const formatoFecha =
        /^\d{4}-\d{2}-\d{2}$/;


    if (
        !formatoFecha.test(
            nuevaFecha
        )
    ) {

        alert(
            "La fecha debe tener el formato AAAA-MM-DD."
        );

        return;

    }


    // =================================================
    // VALIDAR HORA
    // =================================================

    const formatoHora =
        /^([01]\d|2[0-3]):[0-5]\d$/;


    if (
        !formatoHora.test(
            nuevaHora
        )
    ) {

        alert(
            "La hora debe tener el formato HH:MM."
        );

        return;

    }


    try {

        const respuesta =
            await fetch(
                `/api/citas/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        fecha:
                            nuevaFecha,

                        hora:
                            nuevaHora

                    })

                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje
            );

        }


        alert(
            "La cita ha sido reprogramada correctamente."
        );


        // Volver a consultar MySQL
        cargarCitas();


    } catch (error) {

        console.error(error);


        alert(
            "Error al reprogramar la cita:\n\n" +
            error.message
        );

    }

}


// =====================================================
// CANCELAR / ELIMINAR
// =====================================================

async function cancelarCita(id) {

    const cita =
        document.querySelector(
            `[data-id="${id}"]`
        );


    if (!cita) {
        return;
    }


    const mascota =
        cita
            .querySelector("h3")
            .textContent;


    const confirmar =
        confirm(
            `¿Está seguro de cancelar la cita de ${mascota}?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `/api/citas/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje
            );

        }


        alert(
            "La cita ha sido cancelada correctamente."
        );


        // Volver a consultar MySQL
        cargarCitas();


    } catch (error) {

        console.error(error);


        alert(
            "Error al cancelar la cita:\n\n" +
            error.message
        );

    }

}


// =====================================================
// INICIAR
// =====================================================

cargarCitas();