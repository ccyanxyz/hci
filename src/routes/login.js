var express = require('express');
var { User } = require('../models/db');

var router = express.Router();

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	res.render('login');
});

router.post('/', (req, res) => {
	var _user = req.body;
	var password = _user.password;
	var email = _user.email;

	console.log('post data:');
	console.log(_user);

	var query = { email: _user.email };

	User.find(query, (err, users) => {
		if(err) {
			console.log(err);
			return;
		}
		if(users.length === 0){
			return res.redirect('../register');
		}
		var user = users[0]
		if(user.password === password) {
			console.log(user.email + ' login success');
			req.session.user = user;
			return res.redirect('/dashboard');
		} else {
			return res.redirect('/login');
		}
	});
});

module.exports = router;
