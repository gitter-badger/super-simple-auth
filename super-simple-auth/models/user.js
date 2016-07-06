var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	email: {
		type: String,
		index: { unique: true }
	},
	username: {
		type: String
	},
	password: {
		type: String
	},
	token: {
		type: String
	}

});

module.exports = mongoose.model('User', userSchema);
