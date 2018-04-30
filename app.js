var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')();

var data  = require('./routes/data');
var routes = require('./routes/index');

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
var shadesSockets = io.of("/shades-namespace");
var controllerSockets = io.of("/controller-namespace");
var userSockets = io.of("/user-namespace");
var statsSockets = io.of("/stats-namespace");

var sunsConfig = {
  controllerCount: 0,
  screenCount: 0,
  screensUp: false,
  labelsOn: false,
  scaleMultiplier: 1
};

// Track activity on the Lightbox screens
screensSockets.on('connection', function(socket) {
  sunsConfig.screensUp = true;
  sunsConfig.screenCount +=1;
 
  socket.emit("start up", sunsConfig);

  statsSockets.emit("stats update", sunsConfig);
  userSockets.emit("screens up", sunsConfig.screensUp);
  controllerSockets.emit("screens up", sunsConfig.screensUp);

  socket.on("new sun", function(data) {
    userSockets.emit("new sun", data);
    shadesSockets.emit("new sun", data);
  });

  socket.on("end-times started", function(data) {
    controllerSockets.emit("end-times started", data);
  });
  
  socket.on("end-times ended", function(data) {
    controllerSockets.emit("end-times ended", data);
  });

  socket.on("big-bang started", function(data) {
    controllerSockets.emit("big-bang started", data);
  });
  
  socket.on("big-bang ended", function(data) {
    controllerSockets.emit("big-bang ended", data);
  });

  socket.on("disconnect", function(data) {
    sunsConfig.screensUp = false;
    sunsConfig.screenCount -=1;

    statsSockets.emit("stats update", sunsConfig);
    userSockets.emit("screens up", sunsConfig.screensUp);
    controllerSockets.emit("screens up", sunsConfig.screensUp);
  });
});

// Track activity of general users
userSockets.on("connection", function(socket) {
  socket.emit("screens up", sunsConfig.screensUp);

  socket.on("object clicked", function(objectid) {
    screensSockets.emit("object clicked", objectid);
  });
});

// Track activity of the Lightbox screens controller
controllerSockets.on("connection", function(socket) {
  sunsConfig.controllerCount +=1;

  statsSockets.emit("stats update", sunsConfig);
  controllerSockets.emit("screens up", sunsConfig.screensUp);

  socket.on("pause clicked", function() {
    screensSockets.emit("pause clicked");
  });

  socket.on("tell-me clicked", function() {
    sunsConfig.labelsOn = !sunsConfig.labelsOn;

    statsSockets.emit("stats update", sunsConfig);
    screensSockets.emit("tell-me clicked");
    controllerSockets.emit("tell-me state", sunsConfig.labelsOn);
  });

  socket.on("lights clicked", function() {
    screensSockets.emit("lights clicked");
  });

  socket.on("deconstruct clicked", function() {
    screensSockets.emit("deconstruct clicked");
  });

  socket.on("reconstruct clicked", function() {
    screensSockets.emit("reconstruct clicked");
  });

  socket.on("scatter clicked", function() {
    screensSockets.emit("scatter clicked");
  });

  socket.on("end-times clicked", function() {
    screensSockets.emit("end-times clicked");
  });

  socket.on("big-bang clicked", function() {
    screensSockets.emit("big-bang clicked");
  });

  socket.on("multiplier clicked", function(multiplier) {
    sunsConfig.scaleMultiplier = multiplier;

    statsSockets.emit("stats update", sunsConfig);
    screensSockets.emit("set multiplier", sunsConfig.scaleMultiplier);
  });

  socket.on("disconnect", function() {
    sunsConfig.controllerCount -=1;

    statsSockets.emit("stats update", sunsConfig);
  });
});


// Track activity of stats users
statsSockets.on("connection", function(socket) {
  socket.emit("stats update", sunsConfig);
});

module.exports = app;
