var express = require('express');
var router = express.Router();

var user = req.user
router.route('/signup', function(err,res){
	if (! req.isAuthenticated()) {
		res.render('page/signup.html', {
 			title: "สมัครสมาชิก",
 			isAuthenticated : false
 		});
	}else {
		res.render('page/signup.html', {
 			title: "สมัครสมาชิก",
 			isAuthenticated : true,
 			user: user
 	}
});

module.exports = router;
