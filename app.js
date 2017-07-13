const express = require('express'),
    app = express(),
    router = require('./router/router.js'),
    bodyparser = require('body-parser'),
    session = require('express-session'),
    moment = require('moment'),
    user = require('./model/userModel.js'),
    flash = require('connect-flash'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    handlebars = require('express-handlebars').create({
        defaultLayout: 'main', extname: 'hbs'
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 8090);
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session({
    secret: 'xxxxx',
    cookie: { 'maxAge': 60 * 1000 * 30 }
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
    socket.on('postImg', function (mimeType, data) {
        io.sockets.emit('sendImg', mimeType, data, socket.name);
    });
    socket.on('postFile', function (fileName, fileTempName) {
        io.sockets.emit('sendFile', fileName, fileTempName, socket.name);
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

router(app, user, io);

app.get('/', function (req, res) {
    res.download('');
});

server.listen(app.get('port'));