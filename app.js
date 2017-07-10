var express = require('express');
var app = express();
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
    user.deleteUser(req.params.name);
    setTimeout(function () {
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'logout');
    }, 500);
    req.flash('info', '登出成功');
    res.redirect('/');
});
app.get('/chat/:name', checkAuth.checkLoginDB, async function (req, res) {
    res.render('chat', { ChatContent: true });
    setTimeout(function () {
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'login');
    }, 500);
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
server.listen(app.get('port'));