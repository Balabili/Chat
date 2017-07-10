requirejs.config({
    baseUrl: '/js/common',
});
require(['utility'], function (utility) {
    var socket = io.connect();

    var app = new Vue({
        el: "#login",
        data: {
            isRepeat: false,
            errorMsg: '用户名已存在'
        },
        delimiters: ['${', '}'],
        methods: {
            login: function () {
                var self = this, username = $("#loginText").val();
                $.ajax({
                    url: '/chat',
                    type: 'post',
                    data: { loginname: username },
                    success: function (result) {
                        if (result) {
                            self.isRepeat = false;
                            utility.cookieHelper.setCookie('name', username);
                            window.location.href = "/chat/" + username;
                        } else {
                            self.isRepeat = true;
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            }
        }
    });
});