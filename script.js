function cancelarCita(id) {
    const cita = document.querySelector(`[data-id="${id}"]`);

    if (!cita) {
        return;
    }

    const mascota = cita.querySelector("h3").textContent;

    const confirmar = confirm(
        `¿Está seguro de cancelar la cita de ${mascota}?`
    );

    if (confirmar) {
        cita.remove();

        alert("La cita ha sido cancelada correctamente.");
    }
}


function reprogramarCita(id) {
    const cita = document.querySelector(`[data-id="${id}"]`);

    if (!cita) {
        return;
    }

    const nuevaFecha = prompt(
        "Ingrese la nueva fecha (AAAA-MM-DD):"
    );

    if (!nuevaFecha) {
        return;
    }

    const nuevaHora = prompt(
        "Ingrese la nueva hora (HH:MM):"
    );

    if (!nuevaHora) {
        return;
    }

    cita.querySelector(".fecha").textContent = nuevaFecha;
    cita.querySelector(".hora").textContent = nuevaHora;

    alert("La cita ha sido reprogramada correctamente.");
}
