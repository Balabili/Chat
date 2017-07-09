var socket = io.connect();

var app = new Vue({
    el: "#login",
    data: {
    },
    delimiters: ['${', '}'],
    methods: {
        login: function () {
            var username = $("#loginText").val();
            $.ajax({
                url: '/chat',
                type: 'post',
                data: { loginname: username },
                success: function (result) {
                    debugger;
                    socket.emit('login', username);
                    window.location.href = "/chat/" + username;
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    }
});