/*
 *
 * https://github.com/garrettn/ampersand-sync-localforage
 *
 * Copyright (c) 2014 Garrett Nay
 * Licensed under the MIT license.
 */

'use strict';

var localforage = require('localforage'),
  partial = require('lodash-node/modern/functions/partial'),
  isEmpty = require('lodash-node/modern/objects/isEmpty'),
  after = require('lodash-node/modern/functions/after');

function S4() {
  return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

module.exports = {
  sync: function(name) {
    var _this = this;
    var sync = function(method, model, options) {
      // If `this` is a collection it means
      // `collection.fetch` has been called.
      if (this.isCollection) {
        // If there's no localforageKey for this collection, create
        // it.
        if (!this.sync.localforageKey) {
          this.sync.localforageKey = name;
        }
      } else { // `this` is a model if not a collection.
        // Generate an id if one is not set yet.
        if (!model.getId()) {
          model[model.idAttribute] = guid();
        }

        // If there's no localforageKey for this model create it
        if (!model.sync.localforageKey) {
          model.sync.localforageKey = name + "/" + model.id;
        }
      }
      switch (method) {
        case "read":
          return model.id ? _this.find(model, options) : _this.findAll(model, options);
        case "create":
          return _this.create(model, options);
        case "update":
          return _this.update(model, options);
        case "delete":
          return _this.destroy(model, options);
      }
    };

    // This needs to be exposed for later usage, but it's private to
    // the adapter.
    sync._localforageNamespace = name;

    return sync;
  },

  save: function(model, callback) {
    localforage.setItem(model.sync.localforageKey, model.toJSON(), function(data) {
      // If this model has a collection, keep the collection in =
      // sync as well.
      if (model.collection) {
        var collection = model.collection;
        // Create an array of `model.collection` models' ids.
        var collectionData = collection.map(function(model) {
          return collection.model.prototype.sync._localforageNamespace + '/' + model.id;
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
  },

  create: function(model, callbacks) {
    // We always have an ID available by this point, so we just call
    // the update method.
    return this.update(model, callbacks);
  },

  update: function(model, callbacks) {
    this.save(model, function(data) {
      if (callbacks.success) {
        callbacks.success(data);
      }
    });
  },

  find: function(model, callbacks) {
    localforage.getItem(model.sync.localforageKey, function(data) {
      if (isEmpty(data)) {
        if (callbacks.success) {
          callbacks.success(data);
        }
      } else if (callbacks.error) {
        callbacks.error();
      }
    });
  },

  // Only used by `Backbone.Collection#sync`.
  findAll: function(collection, callbacks) {
    localforage.getItem(collection.sync.localforageKey, function(data) {
      if (data && data.length) {
        var done = function() {
          if (callbacks.success) {
            callbacks.success(data);
          }
        };

        // Only execute `done` after getting all of the
        // collection's models.
        done = after(data.length, done);

        var onModel = function(i, model) {
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
  },

  destroy: function(model, callbacks) {
    localforage.removeItem(model.sync.localforageKey, function() {
      var json = model.toJSON();
      if (callbacks.success) {
        callbacks.success(json);
      }
    });
  }
};
