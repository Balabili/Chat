let mongoose = require('mongoose'),
    DB_URL = 'mongodb://localhost:27017/chat';

mongoose.connect(DB_URL);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_URL);
});

mongoose.connection.on('error', function (error) {
    console.log('Mongoose connection error: ' + error);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected.');
});

module.exports = mongoose;