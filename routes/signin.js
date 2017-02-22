var express = require('express');
var router = express.Router();

var user = req.user
router.route('/signin', function(err,res){
 	if (! req.isAuthenticated()) {
		res.render('page/signin.html', {
 			title: "เข้าสู่ระบบ",
 			isAuthenticated : false
 		});
	}else {
		res.render('page/signin.html', {
 			title: "เข้าสู่ระบบ",
 			isAuthenticated : true,
 			user: user
 	}
});

module.exports = router;
