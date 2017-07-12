const mongoose = require('../model/userModel.js');

function checkLoginSession(req, res, next) {
    if (req.session.name) {
        return res.redirect('/chat/' + req.session.name);
    }
    next();
}

async function checkLoginDB(req, res, next) {
    let user = await mongoose.findUserByName(req.params.name);
    if (user.length === 0) {
        return res.redirect('/');
    }
    next();
}

module.exports = {
    //checkLoginSession: checkLoginSession,
    checkLoginDB: checkLoginDB
};