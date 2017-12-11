var request = require('request');
var express = require('express');
var apicache = require('apicache');
var router = express.Router();

var cache = apicache.middleware;

var apikey = process.env.APIKEY;
var apiURL = "http://api.harvardartmuseums.org";

router.get('/rijks', function(req, res, next) {
	// 4300: roughly the total number paintings in the Rijks
  	var randomPageNumber = Math.floor(Math.random() * (4300 - 0) + 0);
	var url = "https://www.rijksmuseum.nl/api/en/collection";
	var qs = {
		key: "G2sJRRM7",
		format: "json",
		imgonly: true,
		p: randomPageNumber,
		ps: 1,
		type: "painting"
	};

	var output = {
		records: [
			{
				source: "Rijksmuseum",
				title: "",
				colors: [],
				url: ""
			}
		]
	};

	request(url, {
			qs: qs
		}, function(error, response, body) {
			var r = JSON.parse(body);

			output.records[0].title = r.artObjects[0].title;
			output.records[0].url = r.artObjects[0].links.web;

			if (r.artObjects[0].webImage) {
				var colorService = "https://ham-color-service.herokuapp.com/extract";
				var csQS = {
					image_url: r.artObjects[0].webImage.url
				};

				request(colorService, {
						qs: csQS
					}, function(error, response, body) {
						if (!error) {
							var rr = JSON.parse(body);
							output.records[0].colors = rr.colors;
						}

						res.send(output);
					});				
			} else {
				res.send(output);
			}

		});

});

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
			var r = JSON.parse(body);

			for (var i = r.records.length - 1; i >= 0; i--) {
				r.records[i].source = "Harvard Art Museums";
			}

			res.send(r);
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
