"use strict";

var http = require("http"),
    url = require("url");

var request = require("request"),
    retry = require("retry");

var version = require("./package.json").version;

http.globalAgent.maxSockets = Infinity;

var quadKey = function(zoom, x, y) {
  var key = "";

  for (var i = zoom; i > 0; i--) {
    var digit = "0";
    var mask = 1 << (i - 1);
    if ((x & mask) !== 0) {
      digit++;
    }
    if ((y & mask) !== 0) {
      digit++;
      digit++;
    }
    key += digit;
  }

  return key;
};

var fetch = function(uri, headers, callback) {
  var operation = retry.operation({
    retries: 3,
    minTimeout: 100,
    maxTimeout: 60e3, // 1 minute
    factor: 54.265
  });

  return operation.attempt(function() {
    return request.get({
      uri: uri,
      encoding: null,
      headers: headers,
      timeout: 30e3
    }, function(err, rsp, body) {
      if (operation.retry(err)) {
        return null;
      }

      if (err) {
        return callback(operation.mainError());
      }

      switch (rsp.statusCode) {
      case 200:
      case 403:
      case 404:
        return callback(null, rsp, body);

      default:
        err = new Error("Upstream error:" + rsp.statusCode);

        if (rsp.statusCode.toString().slice(0, 1) !== "5") {
          return callback(err);
        }

        if (!operation.retry(err)) {
          return callback(operation.mainError(), rsp, body);
        }
      }
    });
  });
};

module.exports = function(tilelive) {
  var HttpSource = function(uri, callback) {
    this.source = url.format(uri).replace(/(\{\w\})/g, function(x) {
      return x.toLowerCase();
    });

    if (!(this.source.match(/{z}/) &&
        this.source.match(/{x}/) &&
        this.source.match(/{y}/)) &&
       !this.source.match(/{q}/)) {
      console.log("Coordinate placeholders missing; assuming %s is a TileJSON endpoint (tilejson+).", this.source);

      return tilelive.load("tilejson+" + this.source, callback);
    }

    this.scale = uri.query.scale || 1;
    this.tileSize = (uri.query.tileSize | 0) || 256;

    // save ourselves some math if we don't need to generate a quad key
    if (this.source.match(/{q}/)) {
      this.quadKey = quadKey;
    } else {
      this.quadKey = function() {};
    }

    return callback(null, this);
  };

  HttpSource.prototype.getTile = function(z, x, y, callback) {
    var tileUrl = this.source
      .replace(/{z}/i, z)
      .replace(/{x}/i, x)
      .replace(/{y}/i, y)
      .replace(/{q}/i, this.quadKey(z, x, y));

    if (this.scale > 1) {
      // replace the last "." with "@<scale>x."
      tileUrl = tileUrl.replace(/\.(?!.*\.)/, "@" + this.scale + "x.");
    }

    var headers = {
      "User-Agent": "tilelive-http/" + version
    };

    return fetch(tileUrl, headers, function(err, rsp, body) {
      if (err) {
        return callback(err);
      }

      switch (rsp.statusCode) {
      case 200:
        var rspHeaders = ["content-type", "content-md5", "content-encoding"].reduce(function(obj, key) {
          if (rsp.headers[key]) {
            obj[key] = rsp.headers[key];
          }

          return obj;
        }, {});

        return callback(null, body, rspHeaders);

      case 404:
        return callback(new Error("Tile does not exist"));

      default:
        return callback(new Error("Upstream error: " + rsp.statusCode));
      }
    });
  };

  HttpSource.prototype.getInfo = function(callback) {
    return callback(null, {
      format: url.parse(this.source).pathname.split(".").pop(),
      bounds: [-180, -85.0511, 180, 85.0511],
      minzoom: 0,
      maxzoom: Infinity,
      autoscale: true
    });
  };

  HttpSource.prototype.close = function(callback) {
    callback = callback || function() {};

    return callback();
  };

  HttpSource.registerProtocols = function(_tilelive) {
    _tilelive.protocols["http:"] = HttpSource;
    _tilelive.protocols["https:"] = HttpSource;
  };

  HttpSource.registerProtocols(tilelive);

  return HttpSource;
};
