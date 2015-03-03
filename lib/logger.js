/*jslint node: true, indent: 2 */
'use strict';

var config = require('./config.js');

var path = require('path');
var winston = require('winston');


// General logging of what happens in the app with winston
var getWinstonLogger = function (logPrefix) {
  var logPath, logger, myTransports;
  logPath = path.join(logPrefix, 'ipproxy');

  if (config.get('logRotation') === 'Y') {
    myTransports = [
      new (winston.transports.DailyRotateFile)({
        filename: logPath,
        datePattern: '-yyyy-MM-dd.log',
        json: false,
        handleException: true
      })
    ];
  } else {
    myTransports = [
      new (winston.transports.File)({
        filename: logPath + '.log',
        json: false,
        handleException: true
      })
    ];
  }

  logger = new (winston.Logger)({transports: myTransports});

  return logger;
};

var logger = getWinstonLogger(config.getLogPrefix());

logger.consoleLog = function (logMsg) {
  console.log(new Date().toISOString() + ' - ' + logMsg);
};

logger.consoleLog('Logger init: ' + module.filename + ' from parent: ' + module.parent.filename);

module.exports = logger;
