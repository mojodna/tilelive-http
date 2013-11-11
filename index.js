"use strict";

var http = require("http"),
    url = require("url");
var request = require("request");
var version = require("./package.json").version;

http.globalAgent.maxSockets = 100;

var HttpSource = function(uri, callback) {
  this.source = url.format(uri);

  return callback(null, this);
};

HttpSource.prototype.getTile = function(z, x, y, callback) {
  var tileUrl = this.source
    .replace(/{z}/i, z)
    .replace(/{x}/i, x)
    .replace(/{y}/i, y);

  var headers = {
    "User-Agent": "tilelive-http/" + version
  };

  console.log("Fetching %d/%d/%d", z, x, y);

  return request.get({
    uri: tileUrl,
    encoding: null,
    headers: headers
  }, function(err, rsp, body) {
    if (err) {
      return callback(err);
    }

    switch (rsp.statusCode) {
    case 200:
      var rspHeaders = {
        "Content-Type": rsp.headers["content-type"]
      };

      return callback(null, body, rspHeaders);

    case 404:
      return callback();

    default:
      return callback(new Error("Upstream error: " + rsp.statusCode));
    }
  });
};

HttpSource.prototype.getInfo = function(callback) {
  return callback(new Error("HttpSource.getInfo() is not implemented."));
};

HttpSource.prototype.close = function(callback) {
  callback = callback || function() {};

  return callback();
};

HttpSource.registerProtocols = function(tilelive) {
  tilelive.protocols["http:"] = HttpSource;
};

module.exports = HttpSource;
