var express = require('express'),
	app = express(),
	utils = require('./utils'),
	auth = require('./auth'),
	port = process.env.PORT || 3000;

app.use('/', auth);

app.listen(port, function() {
	console.log('listening on port ' + port);
});

// console.log(utils.makeSecret());
