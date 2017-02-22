 // vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var jwt    = require('jsonwebtoken');
// custom library
// model
var Model = require('../model/user.model');

// index
var index = function(req, res, next) {
      
   if(!req.isAuthenticated()) {
      res.redirect('signin');
   } else {

      var user = req.user;

      if(user !== undefined) {
         user = user.toJSON();
      }
      res.render('page/index.html', {title: 'Home', user: user});
   }
};
 
// sign in
// GET
var signIn = function(req, res, next) {
   if(req.isAuthenticated()) {
      res.redirect('/');
   }
   res.render('page/signin.html', {title: 'Sign In'});
};
// POST
var signInPost = function(req, res, next) {
   passport.authenticate('local', { successRedirect: '/',
                          failureRedirect: '/signin'}, function(err, user, info) {
      if(err) {
         return res.render('page/signin.html', {title: 'Sign In', errorMessage: err.message});
      } 
      if(!user) {
         return res.render('page/signin.html', {title: 'Sign In', errorMessage: info.message});
      }
      return req.logIn(user, function(err) {
         if(err) {
            return res.render('page/signin.html', {title: 'Sign In', errorMessage: err.message});
         } else {
            return res.redirect('/');
         }
      });
   })(req, res, next);
};

// sign up
// GET
var signUp = function(req, res, next) {
   var user = req.user
   if(req.isAuthenticated()) {
      res.redirect('/');
   } else {
      res.render('page/signup.html', {
         title: 'Sign Up'
      });
   }
};
// POST
var signUpPost = function(req, res, next) {
   var user = req.body;
   var usernamePromise = null;
   usernamePromise = new Model.User({username: user.username}).fetch();

   return usernamePromise.then(function(model) {
      if(model) {
         res.render('page/signup.html', {title: 'signup', errorMessage: 'username already exists'});
      } else {
         //****************************************************//
         // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
         //****************************************************//
         var password = user.password;
         var hash = bcrypt.hashSync(password);
        // create a token
        var token = jwt.sign(user.username, 'secertnajaaa');
        console.log("token : " + token);
         var signUpUser = new Model.User({username: user.username, password: hash, email: user.email, token: token});

         signUpUser.save().then(function(model) {
            // sign in the newly registered user
            signInPost(req, res, next);
         });	
      }
   });
};

// sign out
var signOut = function(req, res, next) {
   console.log("Authenticate : " + req.isAuthenticated);
   if(!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/');
   }
   console.log("Authenticate : " + req.isAuthenticated);
};

// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('page/error.html', {
   	error: '404 Not Found',
   	message: 'error'
   });
};

// export functions
/**************************************/
// index
module.exports.index = index;

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;

// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;