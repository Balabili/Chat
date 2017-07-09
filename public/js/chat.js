var socket = io.connect();

var app = new Vue({
    el: "#chat",
    data: {
        user: [],
        onlineUserNumber: "0人在线"
    },
    mounted: function () {
        this.initData();
    },
    delimiters: ['${', '}'],
    methods: {
        initData: function () {
            $("#textbox").focus();
        },
        sendMsg: function () {
            let textbox = document.getElementById("textbox"), msg = textbox.value;
            textbox.value = "";
            socket.emit('postMsg', msg);
        },
        logout: function () {
            window.location.href = '/logout/你大爷';
        }
    },
    watch: {
        user: function () {
            this.onlineUserNumber = this.user.length + "人在线";
        }
    }
});

socket.on('system', function (time, name, type) {
    var isLogin = type === 'login';
    let msg = name + ' ' + time + ' ' + (isLogin ? '进入聊天室' : '离开聊天室');
    if (isLogin) {
        let p = document.createElement('p'), dialog = document.getElementById("dialog");
        p.innerText = msg;
        p.style.color = "blue";
        dialog.appendChild(p);
        window.app.user.push(name);
        Vue.set(app, 'user', app.user);
    }
});
socket.on('newMsg', function (msg, username) {
    let p = document.createElement('p'), dialog = document.getElementById("dialog");
    p.innerText = username + ':' + msg;
    p.style.color = "black";
    dialog.appendChild(p);
});