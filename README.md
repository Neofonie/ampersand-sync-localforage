# ampersand-sync-localforage

[![NPM version](https://badge.fury.io/js/ampersand-sync-localforage.svg)](http://badge.fury.io/js/ampersand-sync-localforage)

> [localForage](http://mozilla.github.io/localForage) sync adapter for [Ampersand.js](http://ampersandjs.com)

---

This module overrides the sync method of your Ampersand models and collections to use [localForage](http://mozilla.github.io/localForage), a library from Mozilla that provides a unified API for accessing multiple browser storage options (IndexedDB, WebSQL, localStorage). localForage will use the best available option by default.

**WARNING:** This project is still in its early stages, so expect some rough edges or missing functionality. Feel free to file an issue or submit a pull request, to help make this library the best it can be!

## Installation

```
npm install --save ampersand-sync-localforage
```

## Usage

Just override the `sync` method on your models and collections with the function returned from the module.

### Models

Pass a string to the function. This string serves as a namespace that is prefixed to the model’s storage key.

```js
var Model = require('ampersand-model');
var localforage = require('ampersand-sync-localforage');

module.exports = Model.extend({
  sync: localforage('MyModelNamespace'),
  props: {
    id: 'string'
  }
});
```

### Collections

Pass a string to use as the collection’s unique storage key.

```js
var Collection = require('ampersand-rest-collection');
var localforage = require('ampersand-sync-localforage');
var MyModel = require('./my-model');

module.exports = Collection.extend({
  model: MyModel,  // Must also be set up with localForage
  sync: localforage('MyCollection'),
  props: {
    id: 'string'
  }
});
```

Under the hood, a collection is stored as a list of model IDs. Each model has its own entry in whatever storage option is being used.

## Development

You’ll need [Node.js](http://nodejs.org) and [Grunt](http://gruntjs.com/getting-started#installing-the-cli).

This project uses [Karma](http://karma-runner.github.io) to run the tests. In watch mode it launches Firefox, Chrome, and [PhantomJS](http://phantomjs.org/). In single-run mode it launches PhantomJS only.

To watch files for changes and run JSHint and Karma automatically during development, use

```bash
grunt dev
```

To run the linting and tests once, use

```bash
grunt
```

## Credits

This project started as a port of [localForage Backbone](https://github.com/mozilla/localForage-backbone). It also draws inspiration from [ConneXNL's port](https://github.com/ConneXNL/ampersand-sync-localstorage) of [Backbone.localStorage](https://github.com/jeromegn/Backbone.localStorage). Of course, many thanks go to the Ampersand.js team, as well as the developers at Mozilla who provide the localForage library.

## License

Copyright (c) 2014 Garrett Nay  
Licensed under the [MIT license](LICENSE.txt).
