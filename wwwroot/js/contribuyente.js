$(document).ready(function () {
    getListContribuyentes();
});

function getListContribuyentes() {

    var token = obtenerValorDeCookie("secure");
    endpoint = hostApi + "/api/Contribuyente/GetContribuyentes"

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
            var dataContribuyentes = data.item3;

            var datosRow = "";

            for (var i = 0; i < dataContribuyentes.length; i++) {

                datosRow +=

                    "<tr class='filaTabla' " +
                    "data-contribuyente_id='" + dataContribuyentes[i].contribuyente_id + "' " +
                    "data-contribuyente_nombres='" + dataContribuyentes[i].contribuyente_nombres + "' " +
                    "data-contribuyente_apellidos='" + dataContribuyentes[i].contribuyente_apellidos + "' " +
                    "data-contribuyente_tipo='" + dataContribuyentes[i].contribuyente_tipo + "' " +
                    "data-contribuyente_nombre_tipo='" + dataContribuyentes[i].contribuyente_nombre_tipo + "' " +
                    "data-contribuyente_contacto='" + dataContribuyentes[i].contribuyente_contacto + "' " +
                    "data-contribuyente_telefono='" + dataContribuyentes[i].contribuyente_telefono + "' " +
                    "data-contribuyente_direccion='" + dataContribuyentes[i].contribuyente_direccion + "' " +
                    "data-contribuyente_referencia='" + dataContribuyentes[i].contribuyente_referencia + "' " +
                    "data-contribuyente_status='" + dataContribuyentes[i].contribuyente_status + "'>" +
                    "<td>" + dataContribuyentes[i].contribuyente_nombres + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_apellidos + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_tipo + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_nombre_tipo + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_contacto + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_telefono + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_direccion + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_referencia + "</td>" +
                    "<td>" + dataContribuyentes[i].contribuyente_status + "</td>" +
                    "<td id='acciones'>" +
                    "<i style='color: #157347' class='bx bx-edit editar_button' id='editar_programacion'></i>" +
                    "<i style='margin-left: 9px; color: #157347' class='bx bx-trash eliminar_button' id='eliminar__programacion'></i>" +
                    "</td>" +
                    "</tr>";

            }

            $(document).on('click', '.editar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalEditarContribuyente(rowData);
            });

            $(document).on('click', '.eliminar_button', function () {
                var rowData = $(this).closest('tr').data();
                modalConfirmacionEliminar(rowData.contribuyente_id);
            });

            // Eliminar los datos de la tabla existente
            if (!$("#table_contribuyente").hasClass("dataTable")) {
                // Inicializar DataTable en la tabla
                tableSolicitudes = $("#table_contribuyente").DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
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

function modalNewContribuyente(){
    $("#modal_agregar_contribuyente").modal("show");
}

function modalEditarContribuyente(rowData) {
    $("#modal_editar_contribuyente").modal("show");

    var status = rowData.contribuyente_status;

    $("#edit_contribuyente_nombres").val(rowData.contribuyente_nombres);
    $("#edit_contribuyente_apellidos").val(rowData.contribuyente_apellidos);
    $("#edit_contribuyente_tipo").val(rowData.contribuyente_tipo);
    $("#edit_contribuyente_nombre_tipo").val(rowData.contribuyente_nombre_tipo);
    $("#edit_contribuyente_contacto").val(rowData.contribuyente_contacto);
    $("#edit_contribuyente_telefono").val(rowData.contribuyente_telefono);
    $("#edit_contribuyente_direccion").val(rowData.contribuyente_direccion);
    $("#edit_contribuyente_referencia").val(rowData.contribuyente_referencia);

    $('#edit_contribuyente_status_a').prop('checked', status === 'A');
    $('#edit_contribuyente_status_i').prop('checked', status !== 'A');

    $("#boton_edit_contribuyente").on("click", function () {
        guardarEditContribuyente(rowData.contribuyente_id);
    });
}


function guardarNewContribuyente() {

    var token = obtenerValorDeCookie("secure");
    var contribuyente_tipo = $("#input_contribuyente_tipo").val();

    if (contribuyente_tipo !== "EMPRESA" && contribuyente_tipo !== "FAMILIA") {
        alert("Por favor, seleccione una opción válida.");
        return;
    }

    var form = document.querySelector('form');
    if (form.checkValidity()) {

        var contribuyente_status = $("#input_contribuyente_status_a").is(':checked') ? $("#input_contribuyente_status_a").val() : $("#input_contribuyente_status_i").val();

        var dataPost = {
            contribuyente_nombres: $("#input_contribuyente_nombres").val(),
            contribuyente_apellidos: $("#input_contribuyente_apellidos").val(),
            contribuyente_tipo: contribuyente_tipo,
            contribuyente_nombre_tipo: $("#input_contribuyente_nombre_tipo").val(),
            contribuyente_contacto: $("#input_contribuyente_contacto").val(),
            contribuyente_telefono: $("#input_contribuyente_telefono").val(),
            contribuyente_direccion: $("#input_contribuyente_direccion").val(),
            contribuyente_referencia: $("#input_contribuyente_referencia").val(),
            contribuyente_status: contribuyente_status
        };

        dataPost = trimJSONFields(dataPost);

        var endpoint = hostApi + "/api/Contribuyente/RegContribuyente";

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
function guardarEditContribuyente(contribuyente_id) {

    var token = obtenerValorDeCookie("secure");
    var contribuyente_tipo = $("#edit_contribuyente_tipo").val();

    if (contribuyente_tipo !== "EMPRESA" && contribuyente_tipo !== "FAMILIA") {
        alert("Por favor, seleccione una opción válida.");
        return;
    }

    var contribuyente_status = $("#edit_contribuyente_status_a").is(':checked') ? $("#edit_contribuyente_status_a").val() : $("#edit_contribuyente_status_i").val();
    
    var dataPost = {
        contribuyente_id: contribuyente_id.toString(),
        contribuyente_nombres: $("#edit_contribuyente_nombres").val(),
        contribuyente_apellidos: $("#edit_contribuyente_apellidos").val(),
        contribuyente_tipo: contribuyente_tipo,
        contribuyente_nombre_tipo: $("#edit_contribuyente_nombre_tipo").val(),
        contribuyente_contacto: $("#edit_contribuyente_contacto").val(),
        contribuyente_telefono: $("#edit_contribuyente_telefono").val(),
        contribuyente_direccion: $("#edit_contribuyente_direccion").val(),
        contribuyente_referencia: $("#edit_contribuyente_referencia").val(),
        contribuyente_status: contribuyente_status
    };

    dataPost = trimJSONFields(dataPost);

    var endpoint = hostApi + "/api/Contribuyente/UpdContribuyente";

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

function modalConfirmacionEliminar(contribuyente_id) {
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
            eliminarContribuyente(contribuyente_id),
                swalWithBootstrapButtons.fire(
                    'Eliminada!',
                    'El contribuyente fue eliminado.',
                    'success'
                )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelado',
                'El contribuyente sigue almacenado',
                'error'
            )
        }
    })
}

function eliminarContribuyente(contribuyente_id) {

    var token = obtenerValorDeCookie("secure");
    var contribuyente_id = contribuyente_id.toString();

    var dataPost = {
        contribuyente_id: contribuyente_id
    };

    var endpoint = hostApi + "/api/Contribuyente/DelContribuyente";
    $.ajax({
        type: "POST", // Cambia el método HTTP según tu configuración
        url: endpoint, // Cambia la URL a la que enviar la solicitud
        headers: {
            "Authorization": 'Bearer ' + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        success: function (data) {
            // Llama al actuador para eliminar la fila si la eliminación fue exitosa
            var rpta = data.item1; // Cambio aquí
            var msg = data.item2; // Cambio aquí
            if (rpta == "0") {
                setTimeout(function () {
                    location.reload();
                }, 800); // Cambia el valor en milisegundos (2 segundos en este caso)
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
