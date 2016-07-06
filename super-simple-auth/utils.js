var crypto = require('crypto');

module.exports = {
	makeSecret: function() {
		var buffer = crypto.randomBytes(48)
		var token = buffer.toString('hex');
		return token;
	}
}
