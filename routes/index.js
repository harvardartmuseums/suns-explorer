var express = require('express');
var router = express.Router();

var siteTitle = "Suns | Harvard Art Museums";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: siteTitle });
});

/* GET Lighbbox screens page. */
router.get('/screens', function(req, res, next) {
  res.render('screens', { title: siteTitle });
});

/* GET list view page. */
router.get('/list', function(req, res, next) {
  res.render('list', { title: siteTitle });
});

/* GET controller page. */
router.get('/controller', function(req, res, next) {
  res.render('controller', { title: siteTitle });
});


module.exports = router;
