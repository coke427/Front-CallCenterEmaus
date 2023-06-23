function guardarNewSolicitud() {

    var dataPost = {
        soli_nombres: $("#in_nombres").val(),
        soli_apellidos: $("#in_apellidos").val(),
        soli_dni: $("#in_dni").val(),
        soli_telefono: $("#in_telefono").val(),
        soli_correo: $("#in_correo").val(),
        soli_dimension: $("#in_direccion").val(),
        soli_direccion: $("#in_dimension").val(),
        soli_status: "A",
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