var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')();

var data  = require('./routes/data');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// add sockets.io to the app
app.sockets = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/data', data);
app.use('/users', users);

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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var screensSockets = io.of("/screens-namespace");
var controllerSockets = io.of("/controller-namespace");
var userSockets = io.of("/user-namespace");

var controllerCount = 0;
var screensUp = false; 

// Track activity on the Lightbox screens
screensSockets.on('connection', function(socket) {
  screensUp = true;
  userSockets.emit("screens up", screensUp);

  socket.on("new sun", function(data) {
    userSockets.emit("new sun", data);
  });

  socket.on("disconnect", function(data) {
    screensUp = false;
    userSockets.emit("screens up", screensUp);
  });
});

// Track activity of general users
userSockets.on("connection", function(socket) {
  socket.emit("screens up", screensUp);

  socket.on("object clicked", function(objectid) {
    screensSockets.emit("object clicked", objectid);
  });
});

// Track activity of the Lightbox screens controller
controllerSockets.on("connection", function(socket) {
  controllerCount =+1;
  controllerSockets.emit("screens up", screensUp);

  socket.on("pause clicked", function() {
    screensSockets.emit("pause clicked");
  });

  socket.on("lights clicked", function() {
    screensSockets.emit("lights clicked");
  });

  socket.on("scatter clicked", function() {
    screensSockets.emit("scatter clicked");
  });

  socket.on("end-times clicked", function() {
    screensSockets.emit("end-times clicked");
  });

  socket.on("multiplier clicked", function(multiplier) {
    screensSockets.emit("set multiplier", multiplier);
  });
});

module.exports = app;
