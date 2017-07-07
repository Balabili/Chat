let mongoose = require('../lib/mongo.js'),
    Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: { type: String }
});

module.exports = mongoose.model('User', UserSchema);