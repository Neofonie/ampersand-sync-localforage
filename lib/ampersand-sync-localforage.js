/*
 *
 * https://github.com/garrettn/ampersand-sync-localforage
 *
 * Copyright (c) 2014 Garrett Nay
 * Licensed under the MIT license.
 */

'use strict';

var localforage = require('localforage'),
  partial = require('lodash/partial'),
  isEmpty = require('lodash/isEmpty'),
  after = require('lodash/after');

function S4() {
  return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function save(model, callback) {
  localforage.setItem(model.sync.localforageKey, model.toJSON(), function(err, data) {
    // If this model has a collection, keep the collection in sync as well.
    if (model.collection) {
      var collection = model.collection;
      // Create an array of `model.collection` models' ids.
      var collectionData = collection.map(function(model) {
        return collection.model.prototype.sync._localforageNamespace + '/' + model.getId();
      });

      // Bind `data` to `callback` to call after
      // `model.collection` models' ids are persisted.
      callback = callback ? partial(callback, data) : void 0;

      // Persist `model.collection` models' ids.
      localforage.setItem(model.collection.sync.localforageKey, collectionData, callback);
    } else if (callback) {
      callback(data);
    }
  });
}

function update(model, callbacks) {
  save(model, function(err, data) {
    if (callbacks.success) {
      callbacks.success(data);
    }
  });
}

function create(model, callbacks) {
  // We always have an ID available by this point, so we just call
  // the update method.
  return update(model, callbacks);
}

function find(model, callbacks) {
  localforage.getItem(model.sync.localforageKey, function(err, data) {
    if (!isEmpty(data)) {
      if (callbacks.success) {
        callbacks.success(data);
      }
    } else if (callbacks.error) {
      callbacks.error();
    }
  });
}

// Only used by `Collection#sync`.
function findAll(collection, callbacks) {
  localforage.getItem(collection.sync.localforageKey, function(err, data) {
    if (data && data.length) {
      var done = function() {
        if (callbacks.success) {
          callbacks.success(data.filter(function (model) {
            // Because the collection is stored as a list of model keys, some
            // keys may point to models that no longer exist. localForage
            // returns those as null, so just filter those out for now, and
            // when a new model is saved, the list of keys will be updated to
            // match existing models.
            return model !== null;
          }));
        }
      };

      // Only execute `done` after getting all of the
      // collection's models.
      done = after(data.length, done);

      var onModel = function(i, err, model) {
        data[i] = model;
        done();
      };

      for (var i = 0; i < data.length; ++i) {
        localforage.getItem(data[i], partial(onModel, i));
      }
    } else {
      data = [];
      if (callbacks.success) {
        callbacks.success(data);
      }
    }
  });
}

function destroy(model, callbacks) {
  localforage.removeItem(model.sync.localforageKey, function() {
    var json = model.toJSON();
    if (callbacks.success) {
      callbacks.success(json);
    }
  });
}

module.exports = function(name) {
  // Key needs to be a string
  name = name.toString();

  var sync = function(method, model, options) {
    // If `this` is a collection it means
    // `collection.fetch` has been called.
    if (this.isCollection) {
      // Create a localforageKey
      this.sync.localforageKey = name;
    } else { // `this` is a model if not a collection.
      // Generate an id if one is not set yet.
      if (!model.getId()) {
        model[model.idAttribute] = guid();
      }

      // Create a localforageKey
      model.sync.localforageKey = name + "/" + model.getId();
    }
    switch (method) {
      case "read":
        return model.isCollection ? findAll(model, options) : find(model, options);
      case "create":
        return create(model, options);
      case "update":
        return update(model, options);
      case "delete":
        return destroy(model, options);
    }
  };

  // This needs to be exposed for later usage, but it's private to
  // the adapter.
  sync._localforageNamespace = name;

  // Set this initially to avoid localforage warning "undefined used as a key, but it is not a string.'
  sync.localforageKey = name;

  return sync;
};
