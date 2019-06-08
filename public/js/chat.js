
// Doc ready
$(function () {

    const soko_cucu = io();

    // Check if the enter-key has been pressed
    $(document).keypress((e) => {

        if (e.which == 13) {
            $("#snd_txt_btn").click();
        }

    });

    $("#snd_txt_btn").click(function () {

        let input_field = $("#input_txt").val();

        if (input_field == "") {
            $("#feedback_txt").text("Message can't be empty");
        }

        else {

            // Clear feedback-txt
            $("#feedback_txt").text("");

            // Get value from message field and send it to the server
            let text_input = $("#input_txt").val();

            soko_cucu.emit('msg', text_input);

            // Clear message field
            $("#input_txt").val("");

        }
    });

    soko_cucu.on('msg', (data) => {

        console.log(data);
        $("#scroll_div").append(`<article class="message is-dark is-small is-bold">
                                 <div class="message-body"><strong>${data.date_stamp}</strong>
                                 </br><strong>${data.name}: </strong>${data.text_msg}
                                 </div></article>`);

        // Attempt scroll
        $("#scroll_div").scrollTop($("#scroll_div").prop("scrollHeight"));

        // Audio notification
        $("#pop")[0].play();

    });

    soko_cucu.on('login', (data) => {
        
        // Clean previous data in container
        $("#usr_pad").empty();

        // Populate connected users as buttons
        for (let i = 0; i < data.length; i++) {
            $("#usr_pad").append(`<a class="button is-rouded" style="margin-top:26px;">${data[i].f_name} ${data[i].l_name}</a>`);
        }

        // Audio notification
        $("audio#new_user")[0].play();
    });

    soko_cucu.on('logout', (data) => {
        
        // Clean previous data in container
        $("#usr_pad").empty();

        // Remove user based on socket-id
        for (let c = 0; c < data.length; c++) {
            $("#usr_pad").append(`<a class="button is-rouded">${data[c].f_name} ${data[c].l_name}</a>`);
        }
    });

    soko_cucu.on('force_redirect', () => {
        // Force redirect - session has expired
        alert("We appologize, the server has been restarted. Please log back in.")
        window.location.replace("/login");
    });

    $("#logout_btn").click(function () {
        $.ajax({
            method: "POST",
            url: "https://localhost:8000/chat", //TODO: substitute string literal for global var
            success: (data, textStatus, jqXRH) => {
                window.location.replace("/login");
            }
        });
    });

    // Burger nav-menu
    $(".navbar-burger").click(() => {
        
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});