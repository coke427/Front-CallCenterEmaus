$(document).ready(function () {
    getListTurnos();
});

function getListTurnos() {

    var token = obtenerValorDeCookie("secure");
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

            var datosRow = "";

            for (var i = 0; i < dataTurnos.length; i++) {

                datosRow +=

                    "<tr class='filaTabla' " +
                    "data-turno_id='" + dataTurnos[i].turno_id + "' " +
                    "data-turno_nombre='" + dataTurnos[i].turno_nombre + "'>" +
                    "<td>" + dataTurnos[i].turno_nombre + "</td>" +
                    "<td id='acciones'>" +
                    "<i style='color: #FAA716' class='bx bx-edit editar_button' id='editar_programacion'></i>" +
                    "<i style='margin-left: 9px; color: red' class='bx bx-trash eliminar_button' id='eliminar__programacion'></i>" +
                    "</td>" +
                    "</tr>";

            }

            $(document).on('click', '.editar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalEditTurno(rowData);
            });

            $(document).on('click', '.eliminar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalConfirmacionEliminar(rowData.turno_id);
            });

            // Eliminar los datos de la tabla existente
            if (!$("#table_turno").hasClass("dataTable")) {
                // Inicializar DataTable en la tabla
                tableSolicitudes = $("#table_turno").DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // URL de la biblioteca de idioma
                    },
                    dom: 'Bfrtip',
                    buttons: [
                        'excel', 'pdf'
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

function modalNewTurno() {
    $("#modal_agregar_turno").modal("show");
}

function modalEditTurno(rowData) {
    $("#modal_editar_turno").modal("show");
    $("#edit_turno_nombre").val(rowData.turno_nombre);
    $("#boton_edit_turno").on("click", function () {
        guardarEditTurno(rowData.turno_id);
    });
}

function guardarNewTurno() {

    var token = obtenerValorDeCookie("secure");

    var form = document.querySelector('form');
    if (form.checkValidity()) {

        var dataPost = {
            turno_nombre: $("#input_turno_nombre").val()
        };

        dataPost = trimJSONFields(dataPost);

        var endpoint = hostApi + "/api/Turno/RegTurno";

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

    return false;

}

function guardarEditTurno(turno_id) {

    var token = obtenerValorDeCookie("secure");

    var dataPost = {
        turno_id: turno_id.toString(),
        turno_nombre: $("#edit_turno_nombre").val()
    };

    dataPost = trimJSONFields(dataPost);

    var endpoint = hostApi + "/api/Turno/UpdTurno";

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

function modalConfirmacionEliminar(turno_id) {
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
                eliminarTurno(turno_id),
                swalWithBootstrapButtons.fire(
                    'Eliminada!',
                    'El turno fue eliminado.',
                    'success'
                )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelado',
                'El turno sigue almacenada',
                'error'
            )
        }
    })
}

function eliminarTurno(turno_id) {

    var token = obtenerValorDeCookie("secure");

    var dataPost = {
        turno_id: turno_id.toString()
    };

    var endpoint = hostApi + "/api/Turno/DelTurno";
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