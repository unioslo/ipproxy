/*jslint node: true, indent: 2  */
'use strict';

var config = require('./config.js');
var logger = require('./logger.js');

var fs = require('fs');
var path = require('path');
var express = require('express');
var morgan = require('morgan');

var router = require('./router.js');
var bodyParser = require('body-parser');
//var multer = require('multer');

// Apache request logs with morgan
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(
  path.join(config.getLogPrefix(), 'receiverSimAccess.log'),
  {flags: 'a'}
);

var app = express();
app.disable('x-powered-by');
app.enable('case sensitive routing');
app.enable('strict routing'); // Need 'collect', not '/collect/' for logging

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(bodyParser.json()); // for parsing application/json
//app.use(multer()); // for parsing multipart/form-data

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

app.use('/', router);

module.exports = app;
