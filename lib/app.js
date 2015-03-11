/*jslint node: true, indent: 2 */
'use strict';

var config = require('./config.js');
var logger = require('./logger.js');
var ipUtils = require('./ipUtils.js');

var fs = require('fs');
var path = require('path');
var express = require('express');

var router = require('./router.js');

var app = express();
app.disable('x-powered-by');
app.enable('case sensitive routing');
app.enable('strict routing'); // Need 'collect', not '/collect/' for logging

if (config.get('accessLogging') === 'Y') {
  var morgan = require('morgan');
  morgan.token('remote-addr', function (req) {
    return ipUtils.reqIpZeroedLastOctet(req);
  });

  // Apache request logs with morgan
  // create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream(
    path.join(config.getLogPrefix(), 'ipproxyAccess.log'),
    {flags: 'a'}
  );

  // For collect only, make anonymized Apache common log
  app.use(morgan(
    'combined',
    {
      'stream': accessLogStream,
      'skip': function (req) {
        return req.path !== '/collect';
      }
    }
  ));
}

app.use('/', router);

var logErrors = function (err, req, res, next) {
  /*jslint unparam: true */
  logger.consoleLog('ERROR:');
  next(err);
};

app.use(logErrors);

module.exports = app;
