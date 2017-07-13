const fs = require('fs'),
    formidable = require('formidable'),
    checkAuth = require('../middlewares/auth.js'),
    moment = require('moment');
module.exports = function (app, user, io) {
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
    app.get('/chat/:name', checkAuth.checkLoginDB, (req, res) => {
        res.render('chat', { ChatContent: true });
    });
    app.get('/findAllUsers', async (req, res) => {
        let users = await user.findAllUser();
        res.send(users);
    });
    app.post('/chat', async (req, res) => {
        let name = req.body.loginname,
            userModel = await user.findUserByName(name);
        if (userModel.length !== 0) {
            res.send(false);
            return;
        }
        await user.addUser(name);
        res.send(name);
    });
    app.post('/sendImg', function (req, res) {
        let form = formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let img = files.uploadImg,
                imgType = img.name.split('.')[1],
                mimeType = '';
            switch (imgType) {
                case 'jpg':
                    mimeType = 'image/jpeg';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'gif':
                    mimeType = 'image/gif';
                    break;
                default:
                    res.send('type error');
                    return;
            }
            fs.readFile(img.path, 'base64', function (e, data) {
                if (e) {
                    console.log(err);
                } else {
                    // io.sockets.emit('sendImg', mimeType, data);
                    res.send([mimeType, data]);
                }
            });
        });
    });
    app.post('/sendFile', function (req, res) {
        let form = formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let file = files.uploadFile,
                fileType = file.name.split('.')[1],
                fileName = file.name,
                fileTempName = new Date().getTime() + '.' + fileType,
                filepath = 'file/' + fileTempName,
                fileBuffer = fs.readFileSync(file.path),
                writeStream = fs.createWriteStream(filepath);
            writeStream.write(fileBuffer);
            writeStream.end();
            res.send([fileName, fileTempName]);
        });
    });
    app.get('/downloadFile/:filename/:fileTempname', (req, res) => {
        let filepath = 'file/' + req.params.fileTempname;
        res.download(filepath, req.params.filename);
    });
};