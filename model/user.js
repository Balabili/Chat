var User = require('../schema/user.js');

function addUser(username) {
    var user = new User({
        name: username
    });
    user.save(function (err, res) {
        if (err) {
            console.log("add user error:" + err);
        } else {
            console.log('add user ' + username + ' successful.');
        }
    });
}

function deleteUser(username) {
    var userModel = { name: username };
    User.remove(userModel, function () {
        if (err) {
            console.log('delete user error:' + err);
        } else {
            console.log('delete user ' + username + ' successful.');
        }
    });
}

function findUserByName(name) {
    let userModel = { name: name };
    User.find(userModel, function (err) {
        console.log('findUserByName error:' + err);
    });
}

function findAllUser() {
    User.find({}, function (err, res) {
        if (err) {
            console.log('findAllUser Error:' + err);
        }
    });
}

module.exports = {
    addUser: addUser,
    deleteUser: deleteUser,
    findUserByName: findUserByName,
    findAllUser: findAllUser
}