$(document).ready(function () {

    getListTurnos();

    $("#input_turno").on("change", function () {

        $("#new_hora").prop("disabled", false);

        var selectedTurnoId = $(this).val();

        // Check if a valid exercise type is selected
        if (selectedTurnoId) {
            // Call the function to list ranking based on the selected tipoejercicio_id
            getListHoras(selectedTurnoId);
        }

    });

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

            // Limpiar el select
            $("#input_turno").empty();
            $("#input_turno").append('<option value="" disabled selected>Seleccione un turno...</option>');

            // Agregar opciones a input_configPlanilla desde dataConfigPlanilla
            for (var i = 0; i < dataTurnos.length; i++) {
                var item = dataTurnos[i];
                var turno_nombre = capitalizarPrimeraLetra(item.turno_nombre);
                $("#input_turno").append(
                    '<option value="' + item.turno_id + '">' + turno_nombre + '</option>'
                );
            }

        },
        error: function (data) {
            alert('Error fatal ' + data);
            console.log("failure");
        }
    });

}
function getListHoras(selectedTurnoId) {

    var token = obtenerValorDeCookie("secure");
    var dataPost = {
        turno_id: selectedTurnoId.toString()
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
             
            var datosRow = " ";

            for (var i = 0; i < dataHoras.length; i++) {

                datosRow +=

                    "<tr class='filaTabla' " +
                    "data-hora_id='" + dataHoras[i].hora_id + "' " +
                    "data-hora_nombre='" + dataHoras[i].hora_nombre + "' " +
                    "data-turno_id='" + dataHoras[i].turno_id + "' " + "'>" +
                    "<td>" + dataHoras[i].hora_nombre + "</td>" +
                    "<td id='acciones'>" +
                    "<i style='color: #FAA716' class='bx bx-edit editar_button' id='editar_programacion'></i>" +
                    "<i style='margin-left: 9px; color: red' class='bx bx-trash eliminar_button' id='eliminar__programacion'></i>" +
                    "</td>" +
                    "</tr>";

            }

            $(document).on('click', '.editar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalEditarHora(rowData);
            });

            $(document).on('click', '.eliminar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalConfirmacionEliminar(rowData.hora_id);
            });

            if ($.fn.DataTable.isDataTable('#table_hora')) {
                $('#table_hora').DataTable().destroy();
                $('#table_hora tbody').empty(); // Limpia el contenido del cuerpo de la tabla
            }

            if (!$("#table_hora").hasClass("dataTable")) {
                // Inicializar DataTable en la tabla
                tableHora = $("#table_hora").DataTable({
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
            tableHora.rows.add($(datosRow)).draw();

        },
        error: function (data) {
            alert('Error fatal ' + data);
            console.log("failure");
        }
    });
}

function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function modalNewHora() {
    $("#modal_agregar_hora").modal("show");
}

function modalEditarHora(rowData) {
    $("#modal_editar_hora").modal("show");
    $("#edit_hora_nombre").val(rowData.hora_nombre);
    $("#boton_edit_hora").on("click", function () {
        guardarEditHora(rowData);
    });
}

function guardarNewHora() {

    var token = obtenerValorDeCookie("secure");
    var form = document.querySelector('form');
    if (form.checkValidity()) {

        var dataPost = {
            hora_nombre: $("#input_hora_nombre").val(),
            turno_id: $("#input_turno").val().toString()
        };

        dataPost = trimJSONFields(dataPost);

        var endpoint = hostApi + "/api/Hora/RegHora";

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

function guardarEditHora(rowData) {

    var token = obtenerValorDeCookie("secure");

    var dataPost = {
        hora_id: rowData.hora_id.toString(),
        hora_nombre: $("#edit_hora_nombre").val(),
        turno_id: rowData.turno_id.toString()
    };

    dataPost = trimJSONFields(dataPost);

    var endpoint = hostApi + "/api/Hora/UpdHora";

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

function modalConfirmacionEliminar(hora_id) {
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
            eliminarHora(hora_id),
                swalWithBootstrapButtons.fire(
                    'Eliminada!',
                    'La hora fue eliminado.',
                    'success'
                )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelado',
                'La hora sigue almacenada',
                'error'
            )
        }
    })
}

function eliminarHora(hora_id) {

    var token = obtenerValorDeCookie("secure");

    var dataPost = {
        hora_id: hora_id.toString()
    };

    var endpoint = hostApi + "/api/Hora/DelHora";
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