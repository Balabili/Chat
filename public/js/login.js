requirejs.config({
    baseUrl: '/js/common'
});
require(['utility'], function (utility) {
    let app = new Vue({
        el: '#login',
        data: {
            nameInvalid: false,
            errorMsg: ''
        },
        delimiters: ['${', '}'],
        methods: {
            login: function () {
                let self = this, username = $('#loginText').val();
                $.ajax({
                    url: '/chat',
                    type: 'post',
                    data: { loginname: username },
                    success: function (result) {
                        if (result && result[0] === false) {
                            self.nameInvalid = true;
                            self.errorMsg = result[1];
                            return;
                        } else {
                            self.nameInvalid = false;
                            utility.cookieHelper.setCookie('name', username);
                            window.location.href = '/chat/' + username;
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