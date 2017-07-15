const express = require('express'),
    app = express(),
    fs = require('fs'),
    router = require('./router/router.js'),
    bodyparser = require('body-parser'),
    session = require('express-session'),
    moment = require('moment'),
    user = require('./model/userModel.js'),
    flash = require('connect-flash'),
    winston = require('winston'),
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: 'info-file',
                filename: 'logs/filelog-info.log',
                level: 'debug'
            }), new (winston.transports.File)({
                name: 'error-file',
                filename: 'logs/filelog-error.log',
                level: 'error'
            })]
    }),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    handlebars = require('express-handlebars').create({
        defaultLayout: 'main', extname: 'hbs'
    });
fs.existsSync('file') || fs.mkdirSync('file');
fs.existsSync('logs') || fs.mkdirSync('logs');
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

io.on('connection', (socket) => {
    socket.on('online', (name) => {
        socket.name = name;
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), name, 'login');
    });
    socket.on('postMsg', (msg) => {
        io.sockets.emit('newMsg', msg, socket.name);
    });
    socket.on('postImg', (mimeType, data) => {
        io.sockets.emit('sendImg', mimeType, data, socket.name);
    });
    socket.on('postFile', (fileName, fileTempName) => {
        io.sockets.emit('sendFile', fileName, fileTempName, socket.name);
    });
    socket.on('freshPage', (data) => {
        socket.isFresh = data;
    });
    socket.on('disconnect', () => {
        if (socket.name && !socket.isFresh) {
            io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), socket.name, 'logout');
            user.deleteUser(socket.name);
        }
    });
});

app.use((req, res, next) => {
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

app.use((err, req, res, next) => {
    logger.error(err);
    next();
});

router(app, user, io, logger);

server.listen(app.get('port'));