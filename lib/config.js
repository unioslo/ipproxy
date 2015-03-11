/*jslint node: true, indent: 2*/
'use strict';

var config = require('nconf');
var fs = require('fs');
var path = require('path');

var getString = function (parameterName, defaultValue) {
  var confString = config.get(parameterName);
  if (confString && (typeof confString === 'string') && (confString.length > 0)) {
    return confString;
  }
  return defaultValue;
};

var getInt = function (parameterName, defaultValue) {
  var ret, confInt = config.get(parameterName);
  if (confInt && (typeof confInt === 'string') && (confInt.length > 0)) {
    ret = parseInt(confInt, 10);
    if (!isNaN(ret) && (ret > 0)) {
      return ret;
    }
  }
  return defaultValue;
};

// Configuration with nconf
config.argv();  // e.g. node index.js --checkTextOK=N

var configPath = getString('configPath', path.join(process.cwd(), 'config.json'));

(function () {
  /*jslint stupid: true */
  if (fs.existsSync(configPath)) {
    config.file({file: configPath});
  }
}());

config.defaults({
  'configPath': configPath,
  'logPrefix': '',
  'listenPort': '8080',
  'listenInterface': '',
  'proxyToHost': '',
  'proxyToPort': '9080',
  'checkTextOK': 'Y',
  'logRotation': 'N',
  'accessLogging': 'Y',
  'remoteIpHeader': 'X-Forwarded-For'
});

config.getLogPrefix = function () {
  return getString('logPrefix', process.cwd());
};

config.getListenPortInt = function () {
  return getInt('listenPort', 8080);
};

config.getProxyToPortInt = function () {
  return getInt('proxyToPort', 9080);
};

module.exports = config;
