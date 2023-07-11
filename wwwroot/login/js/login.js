function IniciarSesion() {
    var endpoint = hostApi + "/login/listaUsuarios";
    var email = $("#input_user_email").val().trim();
    var password = $("#input_user_password").val().trim();

    $.ajax({
        type: "GET",
        async: true,
        url: endpoint,
        headers: {
            "Content-Type": "application/json"
        },
        dataType: "json",
        beforeSend: function (xhr) {
            console.log("Cargando...");
        },
        success: function (data) {
            console.log("Entrando a la función");

            // Verificar las credenciales del usuario
            var usuarioEncontrado = data[0]; // Acceder al primer elemento del array

            // Verificar el estado del usuario
            if (usuarioEncontrado && usuarioEncontrado.user_email === email && usuarioEncontrado.user_password === password && usuarioEncontrado.user_status === "A") {
                console.log("Acceso concedido");
                window.location.href = "https://localhost:7046/solicitudes";
            } else {
                console.log("Credenciales inválidas o usuario inactivo");
            }
        },
        error: function (xhr, status, error) {
            console.log("Error al obtener la lista de usuarios");
        },
        fail: function (xhr, status, error) {
            console.log("Error en la solicitud AJAX");
        }
    });
}


$(document).ready(function () {
    $('#btn-show-password-usuario').on('mousedown', function () {
        $('#input_user_password').attr('type', 'text');
    }).on('mouseup mouseleave', function () {
        $('#input_user_password').attr('type', 'password');
    });
});