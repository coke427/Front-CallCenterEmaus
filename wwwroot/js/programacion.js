$(document).ready(function () {
    getListProgramaciones();
});

var connection = new signalR.HubConnectionBuilder()
                .configureLogging(signalR.LogLevel.None)
                .withUrl( hostApi + "/receiveCall", {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .build();

connection.start().then(function () {
}).catch(function (err) {
    console.log(err);
})

connection.on("Receive", function (phoneNumber) {
    getUser()
    $("#modal_editar_solicitud .modal-title").html("Llamada entrante <span style='color: #0F5FA6'><strong>" + phoneNumber + "</strong></span>");
    $("#modal_editar_solicitud").modal("show");
})

function getListProgramaciones() {

    var token = obtenerValorDeCookie("secure");
    endpoint = hostApi + "/api/Programacion/GetProgramaciones"

    $.ajax({
        type: "GET",
        async: true,
        url: endpoint,
        headers: {
            "Authorization": 'Bearer ' + token,
            "Content-Type": "application/json"
        },

        dataType: "json",
        beforeSend: function (xhr) {
            console.log("cargando");
        },

        success: function (data) {
            var rpta = data.item1;
            var msg = data.item2;
            var dataProgramaciones = data.item3;

            var datosRow = "";

            for (var i = 0; i < dataProgramaciones.length; i++) {

                datosRow +=

                    "<tr class='filaTabla' " +
                    "data-programacion_id='" + dataProgramaciones[i].programacion_id + "' " +
                    "data-programacion_fecha_llamada='" + dataProgramaciones[i].programacion_fecha_llamada + "' " +
                    "data-programacion_hora_llamada='" + dataProgramaciones[i].programacion_hora_llamada + "' " +
                    "data-programacion_dia='" + dataProgramaciones[i].programacion_dia + "' " +
                    "data-turno_id='" + dataProgramaciones[i].turno_id + "' " +
                    "data-turno_nombre='" + dataProgramaciones[i].turno_nombre + "' " +
                    "data-hora_id='" + dataProgramaciones[i].hora_id + "' " +
                    "data-hora_nombre='" + dataProgramaciones[i].hora_nombre + "' " +
                    "data-programacion_donacion='" + dataProgramaciones[i].programacion_donacion + "' " +
                    "data-contribuyente_id='" + dataProgramaciones[i].contribuyente_id + "'>" +
                        "<td>" + dataProgramaciones[i].programacion_fecha_llamada + "</td>" +
                        "<td>" + dataProgramaciones[i].programacion_hora_llamada + "</td>" +
                        "<td>" + dataProgramaciones[i].programacion_dia + "</td>" +
                        "<td>" + dataProgramaciones[i].turno_nombre + "</td>" +
                        "<td>" + dataProgramaciones[i].hora_nombre + "</td>" +
                        "<td>" + dataProgramaciones[i].programacion_donacion + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_nombre_completo + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_tipo + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_nombre_tipo + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_contacto + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_telefono + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_direccion + "</td>" +
                        "<td>" + dataProgramaciones[i].contribuyente_referencia + "</td>" +
                        "<td id='acciones'>" +
                             "<i style='color: #157347' class='bx bx-edit editar_button' id='editar_programacion'></i>" +
                             "<i style='margin-left: 9px; color: #157347' class='bx bx-trash eliminar_button' id='eliminar_programacion'></i>" +
                        "</td>" +
                    "</tr>";

            }

            $(document).on('click', '.editar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalEditarProgramacion(rowData);
            });

            $(document).on('click', '.eliminar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalConfirmacionEliminar(rowData.programacion_id);
            });

            // Eliminar los datos de la tabla existente
            if (!$("#table_solicitudes").hasClass("dataTable")) {
                // Inicializar DataTable en la tabla
                tableSolicitudes = $("#table_solicitudes").DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // URL de la biblioteca de idioma
                    },
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            extend: 'excel',
                            text: '<img src="/img/excel.png" alt="Excel" style="width: 35px;" />',
                            className: 'btn-export-icon'
                        },
                        {
                            extend: 'pdf',
                            text: '<img src="/img/pdf.png" alt="PDF" style="width: 35px;" />',
                            className: 'btn-export-icon'
                        }
                    ]
                });
            }

            // Agregar los nuevos datos a la tabla
            tableSolicitudes.rows.add($(datosRow)).draw();


        },
        failure: function (data) {
            Swal.close();
            alert('Error fatal ' + data);
            console.log("failure")
        }
    });
}

async function actualizarInputSelect(data) {

    var select1 = data + "_programacion_turno";
    var select2 = data + "_programacion_hora";
    var horaID = "#" + data + "_programacion_hora";

    var select_programacion_turno = document.getElementById(select1).value;
    var select_programacion_hora = document.getElementById(select2);

    var dataHoras = await getListHoras(select_programacion_turno);

    // Limpia el segundo select antes de agregar nuevas opciones
    select_programacion_hora.innerHTML = '';

    $(horaID).append('<option value="" disabled selected>Seleccione hora...</option>');

    // Agregar opciones
    for (var i = 0; i < dataHoras.length; i++) {
        var item = dataHoras[i];
        $(horaID).append(
            '<option value="' + item.hora_id + '">' + item.hora_nombre + '</option>'
        );
    }

}

function convertirFormatoFecha(fechaOriginal) {
    var partesFecha = fechaOriginal.split("/");
    var fechaFormateada = partesFecha[2] + '-' + partesFecha[1] + '-' + partesFecha[0];
    return fechaFormateada;
}

function convertirFechaCorrecta(fechaOriginal) {

    var partesFecha = fechaOriginal.split('-');
    var fechaFormateada = partesFecha[2] + '/' + partesFecha[1] + '/' + partesFecha[0];
    return fechaFormateada;

}

async function modalEditarProgramacion(rowData) {
    $("#modal_editar_programacion").modal("show");

    var dataTurnos = await getListTurnos();

    // Limpiar el select
    $("#edit_programacion_turno").empty();
    $("#edit_programacion_turno").append('<option value="" disabled selected>Seleccione un turno...</option>');

    // Agregar opciones
    for (var i = 0; i < dataTurnos.length; i++) {
        var item = dataTurnos[i];
        var turno_nombre = capitalizarPrimeraLetra(item.turno_nombre);
        $("#edit_programacion_turno").append(
            '<option value="' + item.turno_id + '">' + turno_nombre + '</option>'
        );
    }

    var dataHora = await getListHoras(rowData.turno_id);

    // Limpiar el select
    $("#edit_programacion_hora").empty();
    $("#edit_programacion_hora").append('<option value="" disabled selected>Seleccione hora...</option>');

    // Agregar opciones
    for (var i = 0; i < dataHora.length; i++) {
        var item = dataHora[i];
        $("#edit_programacion_hora").append(
            '<option value="' + item.hora_id + '">' + item.hora_nombre + '</option>'
        );
    }

    var fechaFormateada = convertirFormatoFecha(rowData.programacion_dia);
    $("#edit_programacion_dia").val(fechaFormateada);
    $("#edit_programacion_turno").val(rowData.turno_id);
    $("#edit_programacion_hora").val(rowData.hora_id);
    $("#edit_programacion_donacion").val(rowData.programacion_donacion);
    $("#boton_edit_programacion").on("click", function () {
        guardarEditProgramacion(rowData);
    });
}

function getUser() {

    var token = obtenerValorDeCookie("secure");
    endpoint = hostApi + "/api/Contribuyente/GetContribuyenteDetails"

    $.ajax({
        type: "GET",
        async: true,
        url: endpoint,
        headers: {
            "Authorization": 'Bearer ' + token,
            "Content-Type": "application/json"
        },

        dataType: "json",
        beforeSend: function (xhr) {
            console.log("cargando");
        },

        success: async function (data) {
            var rpta = data.item1;
            var msg = data.item2;
            var dataContribuyente = data.item3;

            const fechaHoraActual = new Date();

            // Obtener la fecha en formato "dd/mm/yyyy"
            const fecha = () => {
                const dia = String(fechaHoraActual.getDate()).padStart(2, '0');
                const mes = String(fechaHoraActual.getMonth() + 1).padStart(2, '0'); // ¡Recuerda que en JavaScript los meses comienzan desde 0!
                const anio = fechaHoraActual.getFullYear();
                return `${dia}/${mes}/${anio}`;
            };

            // Obtener la hora en formato "hh:mm:ss am/pm"
            const hora = () => {
                let horas = fechaHoraActual.getHours();
                const minutos = String(fechaHoraActual.getMinutes()).padStart(2, '0');
                const segundos = String(fechaHoraActual.getSeconds()).padStart(2, '0');
                const periodo = horas >= 12 ? 'pm' : 'am';

                // Convertir de formato de 24 horas a formato de 12 horas
                horas = horas % 12 || 12;

                return `${horas}:${minutos}:${segundos} ${periodo}`;
            };

            $("#input_programacion_fecha_llamada").val(fecha);
            $("#input_programacion_hora_llamada").val(hora);
            $("#input_contribuyente_nombres").val(dataContribuyente[0].contribuyente_nombres);
            $("#input_contribuyente_apellidos").val(dataContribuyente[0].contribuyente_apellidos);
            $("#input_contribuyente_tipo").val(dataContribuyente[0].contribuyente_tipo);
            $("#input_contribuyente_nombre_tipo").val(dataContribuyente[0].contribuyente_nombre_tipo);
            $("#input_contribuyente_contacto").val(dataContribuyente[0].contribuyente_contacto);
            $("#input_contribuyente_telefono").val(dataContribuyente[0].contribuyente_telefono);
            $("#input_contribuyente_direccion").val(dataContribuyente[0].contribuyente_direccion);
            $("#input_contribuyente_referencia").val(dataContribuyente[0].contribuyente_referencia);
            $("#input_contribuyente_status").val(dataContribuyente[0].contribuyente_status); 3

            var dataTurnos = await getListTurnos();

            // Limpiar el select
            $("#input_programacion_turno").empty();
            $("#input_programacion_turno").append('<option value="" disabled selected>Seleccione un Turno...</option>');

            // Agregar opciones
            for (var i = 0; i < dataTurnos.length; i++) {
                var item = dataTurnos[i];
                var turno_nombre = capitalizarPrimeraLetra(item.turno_nombre);
                $("#input_programacion_turno").append(
                    '<option value="' + item.turno_id + '">' + turno_nombre + '</option>'
                );
            }

            $("#boton_guardar_programacion").on("click", function () {
                guardarNewProgramacion(dataContribuyente[0].contribuyente_id);
            });

        },
        failure: function (data) {
            Swal.close();
            alert('Error fatal ' + data);
            console.log("failure")
        }
    });
}

function guardarNewProgramacion(contribuyente_id) {

    var token = obtenerValorDeCookie("secure");

    var form = document.querySelector('form');
    if (form.checkValidity()) {

        var fechaOriginal = $("#input_programacion_dia").val();
        var programacion_dia = convertirFechaCorrecta(fechaOriginal);

        var dataPost = {
            programacion_fecha_llamada: $("#input_programacion_fecha_llamada").val(),
            programacion_hora_llamada: $("#input_programacion_hora_llamada").val(),
            programacion_dia: programacion_dia,
            turno_id: $("#input_programacion_turno").val().toString(),
            hora_id: $("#input_programacion_hora").val().toString(),
            programacion_donacion: $("#input_programacion_donacion").val(),
            contribuyente_id: contribuyente_id
        };

        dataPost = trimJSONFields(dataPost);

        var endpoint = hostApi + "/api/Programacion/RegProgramacion";

        $.ajax({
            type: "POST",
            url: endpoint,
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(dataPost),
            dataType: "json",
            beforeSend: function (xhr) {
                console.log("Guardando...");
            },
            success: function (data) {
                var rpta = data.item1;
                var msg = data.item2;

                if (rpta == "0") {
                    Swal.fire('Guardado', '', 'success');
                    setTimeout(function () {
                        location.reload();
                    }, 800);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: msg,
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    alert("Ocurrió un fallo: " + jqXHR.responseJSON.message);
                } else {
                    alert("Ocurrió un fallo: " + errorThrown);
                }
            }
        });
    }

}

function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function guardarEditProgramacion(rowData) {

    var token = obtenerValorDeCookie("secure");
    var fechaOriginal = $("#edit_programacion_dia").val();
    var programacion_dia = convertirFechaCorrecta(fechaOriginal);

    var dataPost = {
        programacion_id: rowData.programacion_id.toString(),
        programacion_fecha_llamada: rowData.programacion_fecha_llamada,
        programacion_hora_llamada: rowData.programacion_hora_llamada,
        programacion_dia: programacion_dia,
        turno_id: $("#edit_programacion_turno").val().toString(),
        hora_id: $("#edit_programacion_hora").val().toString(),
        programacion_donacion: $("#edit_programacion_donacion").val(),
        contribuyente_id: rowData.contribuyente_id.toString()
    };

    dataPost = trimJSONFields(dataPost);
    console.log(dataPost);

    var endpoint = hostApi + "/api/Programacion/UpdProgramacion";

    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Authorization": 'Bearer ' + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Guardando...");
        },
        success: function (data) {
            var rpta = data.item1;
            var msg = data.item2;
            if (rpta == "0") {
                Swal.fire('Guardado', '', 'success')
                setTimeout(function () {
                    location.reload();
                }, 800);
            } else {

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: msg,
                })
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert("Ocurrió un fallo: " + jqXHR.responseJSON.message);
            } else {
                alert("Ocurrió un fallo: " + errorThrown);
            }
        }
    });

}

function trimJSONFields(obj) {
    if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string') {
            return obj.trim();
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(trimJSONFields);
    }

    const trimmedObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            trimmedObj[key] = trimJSONFields(value);
        }
    }

    return trimmedObj;
}

function modalConfirmacionEliminar(programacion_id) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Estas segur@?',
        text: "No podras revertir los cambios!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, elimina!',
        cancelButtonText: 'No, cancela!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarProgramacion(programacion_id),
                swalWithBootstrapButtons.fire(
                    'Eliminada!',
                    'La programacion fue eliminado.',
                    'success'
                )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelado',
                'La programacion sigue almacenada',
                'error'
            )
        }
    })
}

function eliminarProgramacion(programacion_id) {

    var token = obtenerValorDeCookie("secure");
    var programacion_id = programacion_id.toString();

    var dataPost = {
        programacion_id: programacion_id
    };

    var endpoint = hostApi + "/api/Programacion/DelProgramacion";
    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Authorization": 'Bearer ' + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        success: function (data) {
            var rpta = data.item1;
            var msg = data.item2;
            if (rpta == "0") {
                setTimeout(function () {
                    location.reload();
                }, 800);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: msg,
                })
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert("Ocurrió un fallo: " + jqXHR.responseJSON.message);
            } else {
                alert("Ocurrió un fallo: " + errorThrown);
            }
        }
    });
}

function getListTurnos() {

    var token = obtenerValorDeCookie("secure");
    return new Promise(function (resolve, reject) {

        endpoint = hostApi + "/api/Turno/GetTurnos"

        $.ajax({
            type: "GET",
            async: true,
            url: endpoint,
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type": "application/json"
            },

            dataType: "json",
            beforeSend: function (xhr) {
                console.log("cargando");
            },

            success: function (data) {
                var rpta = data.item1;
                var msg = data.item2;
                var dataTurnos = data.item3;
                resolve(dataTurnos);

            },
            error: function (data) {
                reject('Error fatal ' + data);
                console.log("failure");
            }
        });

    });
}

function getListHoras(turno_id) {

    var token = obtenerValorDeCookie("secure");

    return new Promise(function (resolve, reject) {

        var dataPost = {
            turno_id: turno_id.toString()
        };

        endpoint = hostApi + "/api/Hora/GetHoras"

        $.ajax({
            type: "POST",
            url: endpoint,
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(dataPost),
            dataType: "json",
            beforeSend: function (xhr) {
                console.log("cargando");
            },

            success: function (data) {
                var rpta = data.item1;
                var msg = data.item2;
                var dataHoras = data.item3;
                resolve(dataHoras);

            },
            error: function (data) {
                reject('Error fatal ' + data);
                console.log("failure");
            }
        });

    });
}