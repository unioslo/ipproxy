/*jslint node: true, indent: 2  */
'use strict';

var config = require('./config.js');
var logger = require('./logger.js');

var express = require('express');
var router = express.Router({ strict: true, caseSensitive: true });

var path = require('path');

router.get('/', function (req, res) {
  /*jslint unparam: true */
  var filePath = path.join(process.cwd(), 'static', 'info.html');
  res.sendFile(filePath);
});

router.get('/robots.txt', function (req, res) {
  /*jslint unparam: true */
  var filePath = path.join(process.cwd(), 'static', 'robots.txt');
  res.sendFile(filePath);
});

router.post('/collect', function (req, res) {
  // referrer, useragent, ip_override
  // utf-8 and url-encoded
  logger.info('xxxx -----------------------------------');
  logger.info('originalUrl: ' + req.originalUrl);
  logger.info('Referer: ' + req.header('Referer'));
  logger.info('User-Agent: ' + req.header('User-Agent'));
  logger.info('Body: ' +  JSON.stringify(req.body));
  //logger.info(req.body);
  res.sendStatus(200);
});

module.exports = router;
