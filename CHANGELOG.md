# Changes

## v0.2.0 - 5/7/14

* Disambiguate between URL templates and TileJSON sources (deferring to
  [tilejson](https://github.com/mapbox/node-tilejson) for the latter)
* Switch to factory construction to make `tilelive` available without directly
  depending on it

## v0.1.2 - 3/17/14

* Return an `Error` on 404s to match `tilelive.js` expectations (@gravitystorm)
* Register for `tilejson+https:`

## v0.1.1 - 12/19/14

* Implement `getInfo()` with sensible defaults
* Correct `copyTask.formats` in the docs and examples (@vsivsi)
* Initial released version
