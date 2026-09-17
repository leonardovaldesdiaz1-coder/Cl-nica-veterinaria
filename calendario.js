// =====================================================
// VARIABLES
// =====================================================

let selectedDate = new Date();

let todasLasCitas = [];


// =====================================================
// FORMATO DE FECHA EN ESPAÑOL
// =====================================================

function formatDate(date) {

    return date.toLocaleDateString(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// =====================================================
// FECHA PARA MYSQL
// =====================================================

function formatDateSQL(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// =====================================================
// ACTUALIZAR FECHA
// =====================================================

function updateDate() {

    const dateText =
        formatDate(selectedDate);


    const fechaFormateada =
        dateText.charAt(0).toUpperCase() +
        dateText.slice(1);


    document
        .getElementById("currentDate")
        .textContent =
        fechaFormateada;


    document
        .getElementById("calendarDate")
        .textContent =
        fechaFormateada;


    mostrarCitas();

}


// =====================================================
// CONSULTAR MYSQL
// =====================================================

async function cargarCitas() {

    try {

        const respuesta =
            await fetch("/api/citas");


        if (!respuesta.ok) {

            throw new Error(
                "No fue posible obtener las citas."
            );

        }


        todasLasCitas =
            await respuesta.json();


        mostrarCitas();


    } catch (error) {

        console.error(error);


        document
            .getElementById("timeline")
            .innerHTML = `

                <div class="error-message">

                    No fue posible cargar
                    las citas.

                </div>

            `;

    }

}


// =====================================================
// MOSTRAR CITAS
// =====================================================

function mostrarCitas() {

    const timeline =
        document.getElementById("timeline");


    timeline.innerHTML = "";


    const fechaSeleccionada =
        formatDateSQL(selectedDate);


    const citasDelDia =
        todasLasCitas.filter(
            cita => {

                const fecha =
                    String(cita.fecha)
                    .substring(0, 10);

                return fecha ===
                    fechaSeleccionada;

            }
        );


    // =================================================
    // SIN CITAS
    // =================================================

    if (citasDelDia.length === 0) {

        timeline.innerHTML = `

            <div class="no-citas">

                No hay citas programadas
                para este día.

            </div>

        `;

        return;

    }


    // =================================================
    // CREAR TARJETAS
    // =================================================

    citasDelDia.forEach(
        cita => {

            const appointment =
                document.createElement(
                    "div"
                );


            appointment.className =
                "appointment";


            const hora =
                String(cita.hora)
                .substring(0, 5);


            appointment.innerHTML = `

                <div class="time">
                    ${hora}
                </div>


                <div class="card">

                    <div class="pet-info">

                        <div class="pet-icon">

                            ${obtenerIcono(
                                cita.servicio
                            )}

                        </div>


                        <div>

                            <div class="pet-name">
                                ${cita.mascota}
                            </div>


                            <div class="owner">

                                Dueño:
                                ${cita.propietario}

                            </div>


                            <div class="type">

                                ${cita.servicio}

                            </div>

                        </div>

                    </div>


                    <span class="status
                        ${obtenerClaseEstado(
                            cita.estado
                        )}">

                        ${cita.estado}

                    </span>

                </div>

            `;


            timeline.appendChild(
                appointment
            );

        }
    );

}


// =====================================================
// ICONO
// =====================================================

function obtenerIcono(servicio) {

    const texto =
        String(servicio)
        .toLowerCase();


    if (texto.includes("vacun")) {
        return "💉";
    }


    if (texto.includes("pelu")) {
        return "✂️";
    }


    if (texto.includes("consulta")) {
        return "🐶";
    }


    if (
        texto.includes("revisión") ||
        texto.includes("revision")
    ) {

        return "🔎";

    }


    return "🐾";

}


// =====================================================
// ESTADO
// =====================================================

function obtenerClaseEstado(estado) {

    switch (estado) {

        case "Confirmada":
            return "confirmed";

        case "Pendiente":
            return "pending";

        case "En recepción":
            return "arrived";

        default:
            return "pending";

    }

}


// =====================================================
// DÍA ANTERIOR
// =====================================================

function previousDay() {

    selectedDate.setDate(
        selectedDate.getDate() - 1
    );


    updateDate();

}


// =====================================================
// DÍA SIGUIENTE
// =====================================================

function nextDay() {

    selectedDate.setDate(
        selectedDate.getDate() + 1
    );


    updateDate();

}


// =====================================================
// HOY
// =====================================================

function goToday() {

    selectedDate =
        new Date();


    updateDate();

}


// =====================================================
// INICIO
// =====================================================

updateDate();

cargarCitas();