var express = require('express')
var multer = require('multer')
var { User } = require('../models/db');
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "./public/uploads/");
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({storage: storage});

router.post('/', upload.single('dataset'), function (req, res, next) {
	var u = req.session.user;
	console.log(req.session);
	var query = {email: u.email};
	User.find(query, (err, users) => {
		console.log(users);
		var datasets = users[0].datasets;
		datasets.push(req.file.filename);
		User.update(query, {datasets: datasets}, (err, res) => {
			if(err) {
				console.log('db update failed');
			} else {
				console.log('db update success');
			}
		});
	});
	res.redirect('../dashboard');
});

module.exports = router;
