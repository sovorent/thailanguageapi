var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var cors = require('cors');

var index = require('./routes/index');
var users = require('./control/user');
var word = require ('./routes/word');
var tag = require ('./routes/tag');
var admin = require('./routes/adminpage')

// custom libraries
// routes
var route = require('./routes/user.route');
var insertWord = require('./routes/insertword.route');
// model
var Model = require('./model/user.model');

var app = express();

console.log('Wellcome to Thai Language API ...');
// view engine setup
app.set('views', path.join(__dirname, 'views/'));
//app.engine('ejs', engine);
//app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile); 

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', '1461241591_T-Shirt-2.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
        secret: 'secret strategic xxzzz code',
        resave: false,
        saveUninitialized: true
    }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/',index);
app.use('/userprofile',index);

app.get('/signin', route.signIn);
app.post('/signin', route.signInPost);
app.get('/signup',route.signUp);
app.post('/signup',route.signUpPost);
app.get('/signout', route.signOut);

app.get('/insertword', insertWord.insertword);


app.get('/word',word.word);
app.post('/saveedit' , word.saveedit);
app.get('/callback' , word.callback);
app.get('/deleteword',word.deleteword);
app.get('/reported',word.reported);
app.get('/unreported',word.unreported);
app.post('/savenewword' , insertWord.savenewword);

app.get('/aboutus',index);
app.get('/docapi',index);

app.get('/tag', tag.tag);

app.get('/adminpage',admin.adminpage);
//app.use('/results', result);
// catch 404 and forward to error handler
app.use(function(req, res, next) {

    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {

        res.status(err.status || 500);
        res.render('page/error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('page/error.html', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
