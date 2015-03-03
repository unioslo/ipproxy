/*jslint node: true, indent: 2  */
'use strict';

var config = require('./config.js');

var path = require('path');
var winston = require('winston');

// General logging of what happens in the app with winston
var getWinstonLogger = function (logPrefix) {
  var logPath, logger;
  logPath = path.join(logPrefix, 'receiverSim.log');

  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({filename: logPath, json: false})
    ]
  });
  return logger;
};

var logger = getWinstonLogger(config.getLogPrefix());

console.log('Logger init: ' + module.filename + ' from parent: ' + module.parent.filename);

module.exports = logger;
