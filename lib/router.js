/*jslint node: true, indent: 2 */
"use strict";

var config = require("./config.js");

var express = require("express");
var router = express.Router({ strict: true, caseSensitive: true });

var collect = require("./collect.js");

var path = require("path");

var buffAllOK = new Buffer.from("all ok\n", "utf8");
var buffNotOK = new Buffer.from("not ok\n", "utf8");

router.get("/", function (req, res) {
  /*jslint unparam: true */
  var filePath = path.join(process.cwd(), "static", "info.html");
  res.sendFile(filePath);
});

router.get("/robots.txt", function (req, res) {
  /*jslint unparam: true */
  var filePath = path.join(process.cwd(), "static", "robots.txt");
  res.sendFile(filePath);
});

router.get("/check.txt", function (req, res) {
  /*jslint unparam: true */
  var buffBody;
  if (config.get("checkTextOK") === "Y") {
    buffBody = buffAllOK;
  } else {
    buffBody = buffNotOK;
  }

  // ACE script needs Content-Length and doesn't work with  with chunked transfer encoding
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Content-Length": buffBody.length,
  });
  res.end(buffBody);
});

router.get("/collect", function (req, res) {
  collect(req, res);
});

module.exports = router;
