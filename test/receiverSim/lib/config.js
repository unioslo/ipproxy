/*jslint node: true, indent: 2  */
'use strict';

var config = require('nconf');

// Configuration with nconf
config.argv();  // e.g. node index.js --checkTextOK=N
config.file({ file: 'config.json'});
config.defaults({
  'logPrefix': '',
  'listenPort': '',
  'listenInterface': ''
});

config.getLogPrefix = function () {
  var confLogPrefix = config.get('logPrefix');
  if (confLogPrefix && (typeof confLogPrefix === 'string') && (confLogPrefix.length > 0)) {
    return confLogPrefix;
  }
  return process.cwd();
};

config.getListenPortInt = function () {
  var port,
    listenPort = config.get('listenPort');
  if (listenPort && (typeof listenPort === 'string') && (listenPort.length > 0)) {
    port = parseInt(listenPort, 10);
    if (!isNaN(port) && (port > 0)) {
      return port;
    }
  }
  return 9080;
};

console.log('Config init: ' + module.filename + ' from parent: ' + module.parent.filename);

module.exports = config;
