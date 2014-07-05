# Changes

## v0.3.0 - 7/5/14

* Update `tilejson` dependency to `^0.8.0'.

## v0.2.3 - 5/11/14

* Depend on `tilejson@^0.6.4`, as upstream has picked up the protocol change.

## v0.2.2 - 5/8/14

* Point to the version of `tilejson` that registers for `tilejson+<proto>`

## v0.2.1 - 5/7/14

* Add `tilejson` as a peer dependency

## v0.2.0 - 5/7/14

* Disambiguate between URL templates and TileJSON sources (deferring to
  [tilejson](https://github.com/mapbox/node-tilejson) for the latter)
* Switch to factory construction to make `tilelive` available without directly
  depending on it

## v0.1.2 - 3/17/14

* Return an `Error` on 404s to match `tilelive.js` expectations (@gravitystorm)
* Register for `tilejson+https:`

## v0.1.1 - 12/19/13

* Implement `getInfo()` with sensible defaults
* Correct `copyTask.formats` in the docs and examples (@vsivsi)
* Initial released version
