/*jslint node: true, indent: 2 */
'use strict';

var config = require('./config.js');
var logger = require('./logger.js');
var ipUtils = require('./ipUtils.js');

var http = require('http');
var qstring = require('querystring');

var LOG_BODY = false;

var miniGif = new Buffer('R0lGODlhAQABAIAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
var miniGifByteLength = miniGif.length;

var hrTimeDiffToMillis = function (hrTimeDiff) {
  return (hrTimeDiff[0] * 1e3 + hrTimeDiff[1] * 1e-6).toFixed(2);
};

var postToAnalytics = function (userAgent, referer, query, ip, collectStartHrtime, clientResponseDiff) {
  var postOptions, queryStringified, extra, extraStringified, data, req, postStartHrtime;

  //logger.info('postToAnalytics:' + '\n' + userAgent + '\n' + referer + '\n'
  //  + JSON.stringify(query) + '\n' + ip);

  queryStringified = qstring.stringify(query);
  extra = {
    'uip': ip,
    'ua': userAgent
  };
  if (referer) {
    extra.dr = referer;
  }
  // TODO: Sanity check to see that required fields are there, and that this is a proper request
  // TODO: Check that none of the added fields are already in the incoming query

  extraStringified = qstring.stringify(extra);
  // logger.info('ToBody:' + queryStringified + '&' + extraStringified);
  data = new Buffer(queryStringified + '&' + extraStringified, "utf-8");

  postOptions = {
    host: config.get('proxyToHost'),
    port: config.getProxyToPortInt(),
    path: '/collect',
    method: 'POST',
    headers: {
      'User-Agent': 'UiOIpproxy/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length // safe since we just created it with size to fit the data
    },
    timeout: 10000, // wait 10s for response
    agent: false // not clear if we want connection pooling, turn off for now
  };

  postStartHrtime = process.hrtime();

  req = http.request(postOptions, function (res) {

    var status, headersString, body, postDiff, totalDiff;
    /*jslint unparam: true */
    status = res.statusCode;
    headersString = JSON.stringify(res.headers);
    body = "";

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      if (status !== 200) {
        if (LOG_BODY) {
          // Body makes log binary for grep
          logger.info('POST: ' + status + '\nheaders: ' + headersString + '\nbody: ' + body);
        } else {
          logger.warn('POST: ' + status + '\nheaders: ' + headersString + '\ndata sent: ' + data.toString('utf-8'));
        }
      }
      postDiff = process.hrtime(postStartHrtime);
      totalDiff = process.hrtime(collectStartHrtime);

      // TODO: timings to different log file? Keep running average/max/min, maybe for last hour?
      logger.info('TIMES (ms) poststatus: ' + status + ' client: ' + hrTimeDiffToMillis(clientResponseDiff)
        + ' analytics: ' + hrTimeDiffToMillis(postDiff)
        + ' total: ' + hrTimeDiffToMillis(totalDiff));
    });
  });

  req.on('error', function (e) {
    logger.error('POST: problem with request: ' + e.message);
  });

  req.write(data);
  req.end();
};

var collect = function (req, res) {
  /*jslint unparam: true */

  var startHrtime = process.hrtime(),
    afterResponseDiff,
    userAgent = req.header('User-Agent'),
    referer = req.header('Referer'),
    userIp = ipUtils.reqIpZeroedLastOctet(req);

  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-cache, no-store, must-revalidate', // HTTP 1.1.
    'Pragma': 'no-cache', // HTTP 1.0.
    'Expires': '0', // Proxies.
    'Content-Length': miniGifByteLength
  });
  // From http://commons.wikimedia.org/wiki/File%3aBlank.gif
  res.end(miniGif);

  afterResponseDiff = process.hrtime(startHrtime);

  setImmediate(function () {
    postToAnalytics(userAgent, referer, req.query, userIp, startHrtime, afterResponseDiff);
  });

};

module.exports = collect;
