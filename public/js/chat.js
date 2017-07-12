requirejs.config({
    baseUrl: '/js/common'
});
require(['utility'], function (utility) {
    const socket = io.connect();

    let app = new Vue({
        el: '#chat',
        data: {
            users: [],
            fontColors: ['black', 'red', 'blue', 'green'],
            currentUser: '',
            onlineUserNumber: '0人在线'
        },
        mounted: function () {
            this.initData();
        },
        created: function () {
            document.onkeydown = function (e) {
                let confirm = window.confirm('如果刷新页面，聊天记录将会消失，你确定要离开吗？');
                if (e.keyCode === 116) {
                    if (confirm) {
                        socket.emit('freshPage', true);
                        window.location.reload();
                    } else {
                        return;
                    }
                }
            };
        },
        computed: function () {
        },
        delimiters: ['${', '}'],
        methods: {
            initData: function () {
                $('#textbox').focus();
                this.currentUser = utility.cookieHelper.getCookie('name');
                socket.emit('online', this.currentUser);
            },
            sendMsg: function () {
                let textbox = document.getElementById('textbox'), msg = textbox.value;
                textbox.value = '';
                socket.emit('postMsg', msg);
            },
            sendImg: function () {
                $('#uploadImg').click();
            },
            sendFile: function () {
                $('#uploadFile').val('');
                $('#uploadFile').click();
            },
            uploadImg: function () {
                let imgName = $('#uploadImg').val(), imgType = imgName.split('.')[1],
                    formData = new FormData($('#uploadImgForm')[0]);
                if (imgName !== '' && (imgType === 'jpg' || imgType === 'png' || imgType === 'gif')) {
                    $.ajax({
                        url: '/sendImg',
                        type: 'post',
                        data: formData,
                        enctype: 'multipart/form-data',
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            $('#uploadImg').val('');
                        }, error: function (err) {
                            console.log(err);
                        }
                    });
                }
            },
            uploadFile: function () {
                $('#submitFile').click();
            },
            clear: function () {
                document.getElementById('dialog').innerHTML = '';
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
        let isLogin = type === 'login',
            msg = name + ' ' + time + ' ' + (isLogin ? '进入聊天室' : '离开聊天室');
        $.ajax({
            url: '/findAllUsers',
            type: 'get',
            success: function (results) {
                let users = [];
                if (results && results.length) {
                    for (let result in results) {
                        let user = {};
                        user.name = results[result].name;
                        user.isMe = results[result].name === app.currentUser;
                        users.push(user);
                    }
                    Vue.set(app, 'users', users);
                    app.onlineUserNumber = app.users.length + '人在线';
                    let p = document.createElement('p'), dialog = document.getElementById('dialog');
                    p.innerText = msg;
                    p.style.color = 'blue';
                    p.style.clear = 'both';
                    dialog.appendChild(p);
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
    socket.on('newMsg', function (msg, username) {
        let p = document.createElement('p'), dialog = document.getElementById('dialog');
        p.innerText = username + ':' + msg;
        p.style.color = $('#fontColor').val();
        if (username === app.currentUser) {
            p.innerText = msg;
            p.style.cssFloat = 'right';
        }
        p.style.clear = 'both';
        dialog.appendChild(p);
        dialog.scrollTop = dialog.scrollHeight;
    });
    socket.on('sendImg', function (mimeType, data) {
        let img = document.createElement('img'), dialog = document.getElementById('dialog');
        img.src = 'data:' + mimeType + ';base64,' + data;
        img.style.clear = 'both';
        dialog.appendChild(img);
        dialog.scrollTop = dialog.scrollHeight;
        $('#uploadImg').val('');
    });
});