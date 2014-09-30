/*global describe,it,beforeEach,expect*/
'use strict';

var localforage = require('../lib/ampersand-sync-localforage.js'),
  AmpersandCollection = require('ampersand-rest-collection'),
  AmpersandModel = require('ampersand-model');

describe('ampersand-rest-collection', function () {
  var Collection = AmpersandCollection.extend({
    // Making sure we use an unique localforage namespace by using Date.now
    sync: localforage(Date.now()),
    model: AmpersandModel.extend({
      props: {
        id: 'string',
        hello: 'string'
      },
      sync: localforage('ModelNamespace')
    })
  }),

    collection,
    id;

  beforeEach(function (done) {
    collection = new Collection();
    collection.fetch({
      success: function() {
        done();
      }
    });
  });


  it('saves to localForage', function (done) {
    collection.create({hello: 'world!'}, {
      success: function(model) {
        id = model.getId();

        expect(model).to.be.ok;
        expect(id).to.be.ok;
        expect(model.hello).to.equal('world!');

        done();
      }
    });
  });

  it('fetches from localForage', function (done) {
    collection.fetch({
      success: function () {
        expect(collection.length).to.equal(1);

        var model = collection.get(id);

        expect(model).to.be.ok;
        expect(model.getId()).to.equal(id);
        expect(model.hello).to.equal('world!');

        done();
      }
    });
  });

  it('updates to localForage', function (done) {
    collection.get(id).save({hello: 'you!'}, {
      success: function () {
        expect(collection.get(id).hello).to.equal('you!');

        done();
      }
    });
  });

  it('removes from localForage', function (done) {
    collection.get(id).destroy({
      success: function () {
        expect(collection.length).to.equal(0);

        collection.fetch({
          success: function () {
            expect(collection.length).to.equal(0);
            done();
          }
        });
      }
    });
  });

});
