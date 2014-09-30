/*global describe,it,beforeEach,expect*/
'use strict';

var localforage = require('../lib/ampersand-sync-localforage.js'),
  AmpersandModel = require('ampersand-model');

describe('ampersand-model', function () {

  var Model = AmpersandModel.extend({
    props: {
      id: 'string',
      hello: 'string'
    },
    sync: localforage('ModelNamespace')
  }),

    model,
    id;

  beforeEach(function (done) {
    model = new Model();
    if (id) {
      model.id = id;
      model.fetch({
        success: function () {
          done();
        }
      });
    } else {
      done();
    }
  });

  it('saves to localforage', function (done) {
    model.save({hello: 'world!'}, {
      success: function (model) {
        id = model.getId();

        expect(model).to.be.ok;
        expect(id).to.be.ok;
        expect(model.hello).to.equal('world!');

        done();
      }
    });
  });

  it('fetches from localForage', function (done) {
    model.fetch({
      success: function () {
        expect(model).to.be.ok;
        expect(model.getId()).to.equal(id);
        expect(model.hello).to.equal('world!');

        done();
      }
    });
  });

  it('updates to localForage', function (done) {
    model.save({hello: 'you!'}, {
      success: function () {
        expect(model.hello).to.equal('you!');

        done();
      }
    });
  });

  it('removes from localForage', function (done) {
    model.destroy({
      success: function () {
        model.fetch({
          error: function () {
            done();
          }
        });
      }
    });
  });

});
