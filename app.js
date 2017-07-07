var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var session = require('express-session');
var moment = require('moment');
var user = require('./model/user.js');
var flash = require('connect-flash');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var checkLoginSession = require('./middlewares/auth.js');
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main', extname: 'hbs'
});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 8090);
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session());
app.use(bodyparser());

io.on('connection', function (socket) {
    socket.on('postMsg', function (msg) {
        io.sockets.emit('newMsg', msg, app.get('loginname'));
    });
})

app.use(function (req, res, next) {
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

app.get('/', checkLoginSession, function (req, res) {
    res.render('login');
});
app.get('/logout/:name', function (req, res) {
    res.session.user = null;
    req.flash('info', '登出成功');
    res.render('login');
});
app.get('/chat/:name', function (req, res) {
    res.render('chat', { linkScoketIO: true });
    app.set('loginname', req.params.name);
    setTimeout(function () {
        user.addUser(req.params.name);
        io.sockets.emit('system', moment().format('YYYY-MM-DD HH:mm:ss'), req.params.name, 'login')
    }, 500);
});
app.post('/chat', checkLoginSession, function (req, res) {
    let name = req.body.loginname;
    let userModel = user.findUserByName;
    if (userModel) {
        req.flash('error', '该用户名已经存在');
        return;
    }
    res.redirect('/chat/' + name);
});
server.listen(app.get('port'));