/*jslint node: true, indent: 2 */
'use strict';

var config = require('./lib/config.js');
var logger = require('./lib/logger.js');

var app = require('./lib/app.js');

var server = app.listen(config.getListenPortInt(), function () {
  var host, port, logStr;
  host = server.address().address;
  port = server.address().port;

  logStr = 'ipproxy app listening at http://' + host + ':' + port;
  logger.consoleLog(logStr);
  logger.info(logStr);
});

var gracefulShutdown = function () {
  logger.info('ipproxy about to exit, waiting for remaining connections to complete');

  server.close(function () {
    logger.info('ipproxy app closed gracefully');
    // just wait for log to flush
    setTimeout(function () {
      process.exit(0);
    }, 500); // wait for logs to flush
  });

  // in case we are unable to close gracefully
  setTimeout(function () {
    logger.consoleLog('Unable to close gracefully');
    process.exit(1);  // unable to close gracefully, too late to log normally
  }, 10 * 1000);

};

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);
