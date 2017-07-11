var express = require('express');
var app = express();
var fs = require('fs');
var formidable = require('formidable');
var bodyparser = require('body-parser');
var session = require('express-session');
var moment = require('moment');
var user = require('./model/user.js');
var flash = require('connect-flash');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var checkAuth = require('./middlewares/auth.js');
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main', extname: 'hbs'
});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 8090);
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session({
    secret: 'xxxxx',
    cookie: { maxAge: 60 * 1000 * 30 }
}));
app.use(bodyparser());

io.on('connection', function (socket) {
    socket.on('online', function (name) {
        socket.name = name;
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), name, 'login');
    });
    socket.on('postMsg', function (msg) {
        io.sockets.emit('newMsg', msg, socket.name);
    });
    socket.on('freshPage', function (data) {
        socket.isFresh = data;
    });
    socket.on('disconnect', function () {
        if (socket.name && !socket.isFresh) {
            io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), socket.name, 'logout');
            user.deleteUser(socket.name);
        }
    });
});

app.use(function (req, res, next) {
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

app.use(function (err, req, res, next) {
    console.log(err);
    next();
});

app.get('/', function (req, res) {
    res.render('login', { LoginContent: true });
});
app.get('/logout/:name', function (req, res) {
    setTimeout(function () {
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'logout');
    }, 500);
    req.flash('info', '登出成功');
    res.redirect('/');
});
app.get('/chat/:name', checkAuth.checkLoginDB, function (req, res) {
    res.render('chat', { ChatContent: true });
});
app.get('/findAllUsers', async function (req, res) {
    let users = await user.findAllUser();
    res.send(users);
});
app.post('/chat', async function (req, res) {
    let name = req.body.loginname;
    let userModel = await user.findUserByName(name);
    if (userModel.length != 0) {
        res.send(false);
        return;
    }
    await user.addUser(name);
    res.send(name);
});
app.post('/sendImg', function (req, res) {
    var form = formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let img = files.uploadImg;
        let imgType = img.name.split('.')[1];
        let mimeType = "";
        switch (imgType) {
            case 'jpg':
                mimeType = "image/jpeg";
                break;
            case 'png':
                mimeType = "image/png";
                break;
            case 'gif':
                mimeType = "image/gif";
                break;
            default:
                res.send('type error');
                return;
        }
        fs.readFile(img.path, 'base64', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                io.sockets.emit('sendImg', mimeType, data);
            }
        });
    });
});
server.listen(app.get('port'));