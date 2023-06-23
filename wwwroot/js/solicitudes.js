getListSolicitudes();

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