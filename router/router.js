const fs = require('fs'),
    formidable = require('formidable'),
    checkAuth = require('../middlewares/auth.js'),
    moment = require('moment');
module.exports = function (app, user, io, logger) {
    app.get('/', function (req, res) {
        res.render('login', { LoginContent: true });
    });
    app.get('/logout/:name', function (req, res) {
        req.flash('info', '登出成功');
        res.redirect('/');
    });
    app.get('/chat/:name', checkAuth.checkLoginDB, (req, res) => {
        res.render('chat', { ChatContent: true });
    });
    app.get('/findAllUsers', async (req, res) => {
        try {
            let users = await user.findAllUser();
            res.send(users);
        } catch (error) {
            logger.err(error);
        }

    });
    app.post('/chat', async (req, res) => {
        try {
            let name = req.body.loginname, userModel = [], passRegValidation = false;
            passRegValidation = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(name);
            if (!passRegValidation) {
                res.send([false, '用户名不合法']);
                return;
            }
            userModel = passRegValidation ? await user.findUserByName(name) : [];
            if (userModel.length !== 0) {
                res.send([false, '用户名已经存在']);
                return;
            }
            await user.addUser(name);
            res.send(name);
        } catch (error) {
            logger.error(error);
        }
    });
    app.post('/sendImg', (req, res) => {
        let form = formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let img = files.uploadImg,
                imgType = img.name.split('.')[1],
                mimeType = '', fileData = fs.readFileSync(img.path, 'base64');
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
            res.send([mimeType, fileData]);
        });
    });
    app.post('/sendFile', (req, res) => {
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