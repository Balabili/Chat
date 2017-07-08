var mongoose = require('../model/user.js');

function checkLoginSession(req, res, next) {
    if (req.session.name) {
        return res.redirect('/chat/' + req.session.name);
    }
    next();
}

function checkLoginDB(req, res, next) {
    var user = mongoose.findUserByName(req.params.name);
    if (!user) {
        return res.redirect('/');
    }
    next();
}

module.exports = {
    checkLoginSession: checkLoginSession,
    checkLoginDB: checkLoginDB
};