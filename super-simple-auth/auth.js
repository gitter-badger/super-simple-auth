var mongoose = require('mongoose'),
	express = require('express'),
	expressJWT = require('express-jwt'),
	jwt = require('jsonwebtoken'),
	bodyParser = require('body-parser'),
	email = require("emailjs"),
	user = require('./models/user'),
	router = express.Router();

//environment variables
var secret = process.env.AUTH_SECRET,
	smtpEmail = process.env.AUTH_SMTP_EMAIL,
	smtpPassword = process.env.AUTH_SMTP_PASSWORD,
	smtpHost = process.env.AUTH_SMTP_HOST;

//connect to Mongo when the app initializes
mongoose.connect('mongodb://mongo:27017/users');

smtpServer = email.server.connect({
	user: smtpEmail,
	password: smtpPassword,
	host: smtpHost,
	ssl: true
});

router.use(bodyParser.urlencoded({
	extended: true
}));
router.use(expressJWT({
	secret: secret
}).unless({
	path: ['/login', '/register', {
		url: '/password',
		methods: ['GET', 'POST']
	}]
}));

//user account creation
router.post('/register', function(req, res) {
	var token,
		username = req.body.username,
		password = req.body.password,
		email = req.body.email;

	if (email && username && password) {
		token = jwt.sign({
			email: email,
			username: username
		}, secret);

		new user({
			email: email,
			username: username,
			password: password,
			token: token
		}).save();
		res.send({
			status: 'success'
		});
		res.status(200);
	} else {
		res.send({
			status: 'error: need name and password'
		});
		res.status(401);
	}

});

router.post('/login', function(req, res) {
	var token, info
	password = req.body.password,
		email = req.body.email;

	console.log(email, req.body);

	user.find({
		email: email
	}, function(err, doc) {
		if (err) {
			res.send({
				status: 'error email not found'
			});
			res.status(401);
		} else {
			if (doc[0].password === password) {
				doc[0].password = undefined;
				res.send(doc);
				res.status(200);
			} else {
				res.send({
					status: 'error invalid password'
				});
				res.status(401);
			}
		}
	});

});

router.post('/password', function(req, res) {
	var email = req.body.email;

	user.find({
		email: email
	}, function(err, doc) {
		if (err) {
			res.send({
				status: 'error email not found'
			});
			res.status(401);
		} else {
			smtpServer.send({
				text: 'Hello!\nYou can now access your account here: ' +
					'http://localhost:3000/password?token=' + doc[0].token +
					'&uuid=' + encodeURIComponent(doc[0].email),
				from: smtpEmail,
				to: email,
				subject: 'Token for ' // + host
			}, function(err, message) {
				if (err) {
					res.send({
						status: 'error ' + message
					});
					res.status(401);
				} else {
					res.send({
						status: 'email sent to ' + email
					});
					res.status(401);
				}
			});
		}
	});

});

router.get('/password', function(req, res) {
	var token = req.param('token'),
		uuid = req.param('uuid');

	res.send('get change password');
	res.status(401);
});

router.put('/password', function(req, res) {
	var email = req.user.email,
		newpassword = req.body.password;

	console.log('user', req.user);

	user.update({
		email: email
	}, {
		$set: {
			password: newpassword
		}
	}, function(err, doc) {
		if (err) {
			res.send({
				status: 'error token not found'
			});
			res.status(401);
		} else {
			console.log(newpassword, doc);
			res.send('put change password');
			res.status(401);
		}
	});

});

module.exports = router;
