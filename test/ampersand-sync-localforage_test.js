/*global describe,it,expect*/
'use strict';
var localForage = require('../lib/ampersand-sync-localforage.js');

describe('ampersand-sync-localforage node module.', function() {
  it('must be awesome', function() {
    expect(localForage.awesome()).to.equal('awesome');
  });
});
