function sendMessage() {
    var msg = document.getElementById("message_input").value;
    socketio.emit("message_to_server", { message : msg});
    var x = document.getElementById("box1").checked;
    alert(x);
}