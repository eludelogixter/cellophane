// Doc ready
$(function () {

    // Login
    $("#login_button").click(() => {

        // On-click make btn as load-btn
        $("#login_button").attr('class', 'button is-success is-loading');
        let email_field_value = $("#email_input").val();
        let pwd_field_value = $("#password_input").val();

        $.ajax({
            method: "POST",
            url: "https://localhost:8000/login", //TODO: substitute string-literal for global var
            data: { "email_input": email_field_value, "password_input": pwd_field_value },

            error: (jqXHT, textStatus, errorThrown) => {
                $("#logging_error_msg").text(`${errorThrown}`);
                $("#login_button").attr('class', 'button is-success');
                $("#email_input").attr('class', 'input is-danger');
                $("#password_input").attr('class', 'input is-danger');
            },
            success: (data, textStatus, jqXHR) => {
                $("#login_button").attr('class', 'button is-success');
                window.location.replace("/login");
            }
        });

    });

    // Check if enter key has been pressed
    $(document).keypress((e) => {

        if ($("#password_input").val() != "") {
            if (e.which == 13) {
                $("#login_button").click();
            }
        }
    });
});