var request = require('request');
var express = require('express');
var apicache = require('apicache');
var router = express.Router();

var cache = apicache.middleware;

var apikey = process.env.APIKEY;
var apiURL = "https://api.harvardartmuseums.org";

router.get('/:endpoint', function(req, res, next) {
	var url = apiURL;
	var endpoint = req.params.endpoint;
    var qs = {
        apikey: apikey
    };

    for (var param in req.query) {
        qs[param] = req.query[param];
    }

    url += "/" + endpoint;

    request(url, {
			qs: qs
		}, function(error, response, body) {
			if (error) {
				console.log(error);
				res.send('');

			} else {
				var r = JSON.parse(body);
	
				for (var i = r.records.length - 1; i >= 0; i--) {
					r.records[i].source = "Harvard Art Museums";
				}
	
				res.send(r);
			}
		});

});

router.get('/:endpoint/:itemid', cache('12 hours'), function(req, res, next) {
	var url = apiURL;
    var itemid = req.params.itemid;
    var endpoint = req.params.endpoint;

	url += "/" + endpoint + "/" + itemid;

	request(url, {
			qs: {
				apikey: apikey
			}
		}, function(error, response, body) {
			var r = JSON.parse(body);

			res.send(r);
		});

});


module.exports = router;
