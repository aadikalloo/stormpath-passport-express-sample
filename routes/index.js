var express = require('express');
var router = express.Router();
var passport = require('passport');
var stormpath = require('stormpath');
var app1 = require('../app.js');
var debug = require('debug')('my-application');
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var server = require('../bin/www')

var io = require('socket.io').listen(server); //app //app2

// Render the home page.
router.get('/', function(req, res) {
  res.render('index', { title: 'Home', user: req.user });
});

// Render the registration page.
router.get('/register', function(req, res) {
  res.render('register', { title: 'Register', error: req.flash('error')[0] });
});

// Register a new user to Stormpath.
router.post('/register', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  // Grab user fields.
  if (!username || !password) {
    return res.render('register', { title: 'Register', error: 'Email and password required.' });
  }

  // Initialize our Stormpath client.
  var apiKey = new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  );
  var spClient = new stormpath.Client({ apiKey: apiKey });

  // Grab our app, then attempt to create this user's account.
  var app = spClient.getApplication(process.env['STORMPATH_APP_HREF'], function(err, app) {
    if (err) throw err;

    app.createAccount({
      givenName: 'John',
      surname: 'Smith',
      username: username,
      email: username,
      password: password,
    }, function (err, createdAccount) {
      if (err) {
        return res.render('register', {'title': 'Register', error: err.userMessage });
      } else {
        passport.authenticate('stormpath')(req, res, function () {
          return res.redirect('/dashboard');
        });
      }
    });

  });

});

// Render the login page.
router.get('/login', function(req, res) {
  res.render('login', { title: 'Login', error: req.flash('error')[0] });
});

//render chat page
router.get('/chat', function (req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login');
  }

  res.render('chat', {
    title: 'Chat',
    user: req.user,
    }
  );
});

router.get('/userlist', function (req, res) {
  //if (!req.user || req.user.status !== 'ENABLED') {
  //  return res.redirect('/login');
  //}
  console.log(1);
  res.render('userlist', {
      title: 'Userlist',
      user: req.user,
  });
});


// Logout the user, then redirect to the home page.
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Authenticate a user.
router.post(
  '/login',
  passport.authenticate(
    'stormpath',
    {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.',
    }
  )
);

// Render the dashboard page.
router.get('/dashboard', function (req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login');
  }

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    }
  );
});

module.exports = router;
