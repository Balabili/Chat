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
                if (e.keyCode === 116) {
                    let confirm = window.confirm('如果刷新页面，聊天记录将会消失，你确定要离开吗？');
                    if (confirm) {
                        socket.emit('freshPage', true);
                        window.location.reload();
                    } else {
                        return;
                    }
                }
            };
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
                $('#uploadImg').val('');
                $('#uploadImg').click();
            },
            sendFile: function () {
                $('#uploadFile').val('');
                $('#uploadFile').click();
            },
            uploadImg: function () {
                let imgName = $('#uploadImg').val(), imgType = imgName.split('.')[1];
                if (imgName !== '' && (imgType === 'jpg' || imgType === 'png' || imgType === 'gif')) {
                    let formData = new FormData($('#uploadImgForm')[0]);
                    $.ajax({
                        url: '/sendImg',
                        type: 'post',
                        data: formData,
                        enctype: 'multipart/form-data',
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            socket.emit('postImg', ...result);
                        }, error: function (err) {
                            console.log(err);
                        }
                    });
                }
            },
            uploadFile: function () {
                let fileName = $('#uploadFile').val(), formData = new FormData($('#uploadFileForm')[0]);
                if (fileName !== '') {
                    $.ajax({
                        url: '/sendFile',
                        type: 'post',
                        data: formData,
                        enctype: 'multipart/form-data',
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            socket.emit('postFile', ...result);
                        }, error: function (err) {
                            console.log(err);
                        }
                    });
                }
            },
            clear: function () {
                document.getElementById('dialog').innerHTML = '';
            },
            logout: function () {
                this.currentUser = utility.cookieHelper.delCookie('name');
                window.location.href = '/logout/' + this.currentUser;
            }
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
    socket.on('sendImg', function (mimeType, data, username) {
        let div = document.createElement('div'), img = document.createElement('img'),
            dialog = document.getElementById('dialog');
        img.src = 'data:' + mimeType + ';base64,' + data;
        div.style.clear = 'both';
        if (username === app.currentUser) {
            div.style.cssFloat = 'right';
        } else {
            let span = document.createElement('span');
            span.innerText = username + ':';
            div.appendChild(span);
        }
        div.appendChild(img);
        dialog.appendChild(div);
        dialog.scrollTop = dialog.scrollHeight;
    });
    socket.on('sendFile', function (fileName, fileTempName, name) {
        let div = document.createElement('div'), download = document.createElement('a'),
            dialog = document.getElementById('dialog');
        download.href = '/downloadFile/' + fileName + '/' + fileTempName;
        download.innerText = fileName;
        if (name === app.currentUser) {
            div.style.cssFloat = 'right';
        } else {
            let span = document.createElement('span');
            span.innerText = name + ':';
            div.appendChild(span);
        }
        div.style.clear = 'both';
        div.appendChild(download);
        dialog.appendChild(div);
        dialog.scrollTop = dialog.scrollHeight;
    });
});