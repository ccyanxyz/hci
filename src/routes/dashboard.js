var express = require('express');
var { User } = require('../models/db');

var router = express.Router();

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
	var datasets = [];
	var u = req.session.user;
	User.find({email: u.email}, (err, users) => {
		if(err) {
			console.log('find user failed');
			res.send('user not found');
		} else {
			console.log(users[0]);
			res.render('dashboard', {datasets: users[0].datasets});
		}
	})
});

module.exports = router;
