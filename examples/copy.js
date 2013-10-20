"use strict";

var tilelive = require("tilelive");
require("./").registerProtocols(tilelive);
require("mbtiles").registerProtocols(tilelive);

var template = "http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg";

var scheme = tilelive.Scheme.create("scanline", {
  minzoom: 10,
  maxzoom: 13,
  bbox: [-118.9448, 32.8007, -117.6462, 34.8233]
});

var copyTask = new tilelive.CopyTask(template, "mbtiles://./watercolor-la.mbtiles", scheme);
copyTask.formats = "tile";

copyTask.start(function(err) {
  if (err) {
    throw err;
  }
});

copyTask.on("progress", console.log);
copyTask.on("finished", function() {
  console.log("Done");
});
