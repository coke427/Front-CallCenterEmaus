
function getListSolicitudes() {

    endpoint = hostApi + "/solicitud/listaSolicitudes"

    $.ajax({
        type: "GET",
        async: true,
        url: endpoint,
        headers: {
            "Content-Type": "application/json"
        },

        dataType: "json",
        beforeSend: function (xhr) {
            console.log("cargando");
        },

        success: function (data) {

            var dataSolicitudes = data;
            var datosRow = "";

            for (var i = 0; i < dataSolicitudes.length; i++) {
                datosRow +=

                    "<tr class='filaTabla'>" +
                    "<td>" +
                    "<input style='margin-right: 10px;' " +
                    "data-soli_nombres='" + dataSolicitudes[i].soli_nombres + "' " +
                    "data-soli_apellidos='" + dataSolicitudes[i].soli_apellidos + "' " +
                    "data-soli_dni='" + dataSolicitudes[i].soli_dni + "' " +
                    "data-soli_telefono='" + dataSolicitudes[i].soli_telefono + "' " +
                    "data-soli_correo='" + dataSolicitudes[i].soli_correo + "' " +
                    "data-soli_dimension='" + dataSolicitudes[i].soli_dimension + "' " +
                    "data-soli_direccion='" + dataSolicitudes[i].soli_direccion + "' " +
                    "data-soli_status='" + dataSolicitudes[i].soli_status + "' " +
                    "type='radio' " + "id='seleccionar_fila_solicitudes" + i + "' name='radio_solicitudes'>" +
                    "<label for='seleccionar_fila_solicitudes" + i + "'>" + dataSolicitudes[i].soli_dni + "</label>" +
                    "</td>" +
                    "<td>" + dataSolicitudes[i].soli_nombres + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_apellidos + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_telefono + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_correo + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_dimension + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_direccion + "</td>" +
                    "<td>" + dataSolicitudes[i].soli_status + "</td>" +
                    "</tr>";

            }

            if ($.fn.DataTable.isDataTable("#table_solicitudes")) {
                tableSolicitudes.clear().draw();
            }

            // Eliminar los datos de la tabla existente
            if (!$("#table_solicitudes").hasClass("dataTable")) {
                // Inicializar DataTable en la tabla
                tableSolicitudes = $("#table_solicitudes").DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json' // URL de la biblioteca de idioma
                    },
                });
            }

            // Agregar los nuevos datos a la tabla
            tableSolicitudes.rows.add($(datosRow)).draw();

            // Agregar eventos de click a cada fila de la tabla
            $('#table_solicitudes tbody').on('click', 'tr', function () {
                // Encuentra el radio button dentro de la fila clickeada y lo selecciona
                $(this).find('input[type="radio"]').prop('checked', true);
                // Llama a la función para el botón de editar
                setBtnEditarSolicitud($(this).find('input[type="radio"]'));
            });

            $('input[name="radio_solicitudes"]').change(function () {
                //Verifica si el radio button está seleccionado
                if ($(this).is(':checked')) {
                    //Llama a la función que se va a ejecutar
                    setBtnEditarSolicitud(this);
                }
            });
        },
        failure: function (data) {
            Swal.close();
            alert('Error fatal ' + data);
            console.log("failure")
        }
    });
}


function guardarNewSolicitud() {

    var dataPost = {
        soli_nombres: $("#in_nombres").val().trim(),
        soli_apellidos: $("#in_apellidos").val().trim(),
        soli_dni: $("#in_dni").val().trim(),
        soli_telefono: $("#in_telefono").val().trim(),
        soli_correo: $("#in_correo").val().trim(),
        soli_dimension: $("#in_direccion").val().trim(),
        soli_direccion: $("#in_dimension").val().trim(),
        soli_status: "P",
    };

    var endpoint = hostApi + "/solicitud/regSolicitud";
    console.log(endpoint)
    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Guardando...");
            $("#btnGuardarNewSolicitud").attr("disabled", true);
            $("#btnGuardarNewSolicitud").html("Guardando...");
        },
        success: function (data) {
            if (data == "0") {
                location.reload();
            } else {
                alert("Ocurrió un error: " + data.message);
                $("#btnGuardarNewSolicitud").attr("disabled", false);
                $("#btnGuardarNewSolicitud").html("Guardar");
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


function setBtnEditarSolicitud(object) {

    var soli_nombres = $(object).data().soli_nombres;
    var soli_apellidos = $(object).data().soli_apellidos;
    var soli_dni = $(object).data().soli_dni;
    var soli_telefono = $(object).data().soli_telefono;
    var soli_correo = $(object).data().soli_correo;
    var soli_dimension = $(object).data().soli_dimension;
    var soli_direccion = $(object).data().soli_direccion;
    var soli_status = $(object).data().soli_status;

    $('#editar_solicitud').data('soli_nombres', soli_nombres);
    $('#editar_solicitud').data('soli_apellidos', soli_apellidos);
    $('#editar_solicitud').data('soli_dni', soli_dni);
    $('#editar_solicitud').data('soli_telefono', soli_telefono);
    $('#editar_solicitud').data('soli_correo', soli_correo);
    $('#editar_solicitud').data('soli_dimension', soli_dimension);
    $('#editar_solicitud').data('soli_direccion', soli_direccion);
    $('#editar_solicitud').data('soli_status', soli_status);

}




function modalEditarSolicitud(object) {

    // Verificamos que se haya seleccionado un radio button
    if (!$('input[name="radio_solicitudes"]:checked').val()) {
        alert("Selecciona una solicitud");
        return;
    }

    // Obtenemos el codigo de la solicitud seleccionada
    var dni = $(object).data().soli_dni;

    // Seteamos el título del modal con el dni de la solicitud      
    $("#modal_editar_solicitud .modal-title").html("Editando Solicitud, DNI: <span style='color: #0F5FA6'><strong>" + dni + "</strong></span>");

    //Boton Guadar
    $(".boxBtnGuardarEditSolicitud").html("<button class='btn btn-sm btn-success ml-auto' id='btnGuardarEditSolicitud' onClick='guardarEditSolicitud()'>Actualizar</button>");

    // Seteamos los valores de los inputs con la información de la solicitud seleccionado
    $("#ed_soli_nombres").val($(object).data().soli_nombres);
    $("#ed_soli_apellidos").val($(object).data().soli_apellidos);
    $("#ed_soli_dni").val($(object).data().soli_dni);
    $("#ed_soli_telefono").val($(object).data().soli_telefono);
    $("#ed_soli_correo").val($(object).data().soli_correo);
    $("#ed_soli_dimension").val($(object).data().soli_dimension);
    $("#ed_soli_direccion").val($(object).data().soli_direccion);

    var valorEstado = $(object).data().soli_status;

    if (valorEstado == 'A') {
        $('#ed_soli_estado_a').prop('checked', true)
    }
    else {
        $('#ed_soli_estado_i').prop('checked', true)
    }

    // Mostramos el modal
    $("#modal_editar_solicitud").modal("show");
}


function guardarEditSolicitud() {

    var soli_status;
    if ($('#ed_soli_estado_a').is(':checked')) {
        soli_status = $("#ed_contri_estado_a").val();
    } else {
        soli_status = $("#ed_soli_estado_i").val();
    }

    var dataPost = {
        soli_nombres: $("#btnGuardarEditSolicitud").val().trim(),
        soli_apellidos: $("#ed_soli_apellidos").val().trim(),
        soli_dni: $("#ed_soli_dni").val().trim(),
        soli_telefono: $("#ed_soli_telefono").val().trim(),
        soli_correo: $("#ed_soli_correo").val().trim(),
        soli_dimension: $("#ed_soli_dimension").val().trim(),
        soli_direccion: $("#ed_soli_direccion").val().trim(),
        soli_status: soli_status,
    };

    var endpoint = hostApi + "/solicitud/updSolicitud";
    console.log(endpoint)
    $.ajax({
        type: "POST",
        url: endpoint,
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify(dataPost),
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Guardando...");
            $("#btnGuardarEditSolicitud").attr("disabled", true);
            $("#btnGuardarEditSolicitud").html("Guardando...");
        },
        success: function (data) {
            if (data == "0") {
                location.reload();
            } else {
                alert("Ocurrió un error: " + data.message);
                $("#btnGuardarEditSolicitud").attr("disabled", false);
                $("#btnGuardarEditSolicitud").html("Guardar");
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