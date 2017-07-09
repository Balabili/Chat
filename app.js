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
    socket.on('online', async function (name) {
        socket.name = name;
        console.log('link' + socket.name);
    });
    socket.on('postMsg', function (msg) {
        io.sockets.emit('newMsg', msg, app.get('loginname'));
    });
    socket.on('disconnect', function () {
        console.log('dis:' + socket.name);
    });
})

app.use(function (req, res, next) {
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

app.get('/', checkAuth.checkLoginSession, function (req, res) {
    res.render('login', { LoginContent: true });
});
app.get('/logout/:name', function (req, res) {
    req.session.name = null;
    user.deleteUser(req.params.name);
    setTimeout(function () {
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'logout')
    }, 500);
    req.flash('info', '登出成功');
    res.redirect('/');
});
app.get('/chat/:name', checkAuth.checkLoginDB, function (req, res) {
    res.render('chat', { ChatContent: true });
    app.set('loginname', req.params.name);
    setTimeout(function () {
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'login')
    }, 500);
});
app.post('/chat', checkAuth.checkLoginSession, async function (req, res) {
    let name = req.body.loginname;
    let userModel = await user.findUserByName(name);
    if (userModel.length != 0) {
        req.flash('error', '该用户名已经存在');
        return;
    }
    await user.addUser(name);
    req.session.name = name;
    res.send(name);
});
server.listen(app.get('port'));