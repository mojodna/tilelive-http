# tilelive-http

I am an HTTP source for [tilelive](https://github.com/mapbox/tilelive.js).

## Usage

```javascript
var tilelive = require("tilelive");
require("tilelive-http")(tilelive);
require("mbtiles").registerProtocols(tilelive);

var template = "http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg";

var scheme = tilelive.Scheme.create("scanline", {
  minzoom: 10,
  maxzoom: 11,
  bbox: [-118.9448, 32.8007, -117.6462, 34.8233]
});

var copyTask = new tilelive.CopyTask(template, "mbtiles://./watercolor-la.mbtiles", scheme);
copyTask.formats = ["tile"];

copyTask.start(function(err) {
  if (err) {
    throw err;
  }
});

copyTask.on("progress", console.log);
copyTask.on("finished", function() {
  console.log("Done!");
});
```

## Environment Variables

* `TILELIVE_USER_AGENT` - `User-Agent` header when making upstream requests
