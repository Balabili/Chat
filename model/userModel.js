let mongoose = require('../lib/mongo.js'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        name: { type: String }
    }),
    User = mongoose.model('User', UserSchema);

function addUser(username) {
    let user = new User({
        name: username
    });
    user.save(function (err, res) {
        if (err) {
            console.log('add user error:' + err);
        } else {
            console.log('add user ' + username + ' successful.');
        }
    });

}

function deleteUser(username) {
    let userModel = { name: username };
    User.remove(userModel, function (err) {
        if (err) {
            console.log('delete user error:' + err);
        } else {
            console.log('delete user ' + username + ' successful.');
        }
    });
}

function findUserByName(name) {
    let userModel = { name: name };
    return User.find(userModel, function (err, res) {
        if (err) {
            console.log('findUserByName error:' + err);
        } else {
            return res;
        }
    });
}

function findAllUser() {
    return User.find({}, function (err, res) {
        if (err) {
            console.log('findAllUser Error:' + err);
        } else {
            return res;
        }
    });
}

module.exports = {
    addUser: addUser,
    deleteUser: deleteUser,
    findUserByName: findUserByName,
    findAllUser: findAllUser
};