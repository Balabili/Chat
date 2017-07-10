requirejs.config({
    baseUrl: '/js/common',
});
require(['utility'], function (utility) {
    var socket = io.connect();

    var app = new Vue({
        el: "#chat",
        data: {
            users: [],
            currentUser: '',
            onlineUserNumber: "0人在线"
        },
        mounted: function () {
            this.initData();
        },
        created: function () {
            var self = this;
            document.onkeydown = function (e) {
                if (e.keyCode === 116) {
                    socket.emit('freshPage', true);
                    window.location.reload();
                }
            }
        },
        computed: function () {

        },
        delimiters: ['${', '}'],
        methods: {
            initData: function () {
                $("#textbox").focus();
                this.currentUser = utility.cookieHelper.getCookie('name');
                socket.emit('online', this.currentUser);
            },
            sendMsg: function () {
                let textbox = document.getElementById("textbox"), msg = textbox.value;
                textbox.value = "";
                socket.emit('postMsg', msg);
            },
            submit: function () {
                this.sendMsg();
            },
            logout: function () {
                this.currentUser = utility.cookieHelper.delCookie('name');
                window.location.href = '/logout/' + this.currentUser;
            }
        },
        watch: {

        }
    });

    socket.on('system', function (time, name, type) {
        let isLogin = type === 'login';
        let msg = name + ' ' + time + ' ' + (isLogin ? '进入聊天室' : '离开聊天室');
        $.ajax({
            url: '/findAllUsers',
            type: 'get',
            success: function (results) {
                if (results && results.length) {
                    var users = [];
                    for (var result in results) {
                        var user = {};
                        user.name = results[result].name;
                        user.isMe = results[result].name === app.currentUser;
                        users.push(user);
                    }
                    Vue.set(app, 'users', users);
                    app.onlineUserNumber = app.users.length + "人在线";
                    let p = document.createElement('p'), dialog = document.getElementById("dialog");
                    p.innerText = msg;
                    p.style.color = "blue";
                    p.style.clear = "both";
                    dialog.appendChild(p);
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
    socket.on('newMsg', function (msg, username) {
        let p = document.createElement('p'), dialog = document.getElementById("dialog");
        p.innerText = username + ':' + msg;
        p.style.color = "black";
        if (username === app.currentUser) {
            p.innerText = msg;
            p.style.backgroundColor = "lightgreen";
            p.style.cssFloat = "right";
        }
        p.style.clear = "both";
        dialog.appendChild(p);
    });
});