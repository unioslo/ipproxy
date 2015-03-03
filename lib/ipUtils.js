/*jslint node: true, indent: 2 */
'use strict';

var config = require('./config.js');

// Utility functions

// getip function copied from Morgan (private there)
var getip = function (req) {
  /*jslint nomen: true */
  return req.ip
    || req._remoteAddress
    || (req.connection && req.connection.remoteAddress)
    || undefined;
};

var ipZeroedLastOctet = function (ipStr) {
  var octets, zeroed;
  octets = ipStr.split(/\./).map(function (m) {
    return parseInt(m, 10);
  });
  octets[3] = 0;
  zeroed = octets.join('.');
  return zeroed;
};

module.exports.reqIpZeroedLastOctet = function (req) {
  var beforeAnon, afterAnon, remoteIpHeader;
  beforeAnon = '';
  remoteIpHeader = config.get('remoteIpHeader');
  if (remoteIpHeader && (typeof remoteIpHeader === 'string') && (remoteIpHeader.length > 0)
      && req.get(remoteIpHeader)) {
    beforeAnon = req.get(remoteIpHeader);
  } else {
    beforeAnon = getip(req);
  }
  afterAnon = ipZeroedLastOctet(beforeAnon);
  return afterAnon;
};
