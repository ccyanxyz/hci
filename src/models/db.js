var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// user schema
var userModel = new Schema({
	email: { type: String, unique: true },
	username: String,
	password: String,
	datasets:[ String ]
});

var User = mongoose.model('User', userModel);

module.exports = {
	User,
};
