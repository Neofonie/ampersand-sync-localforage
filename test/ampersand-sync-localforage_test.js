/*global describe,it*/
'use strict';
var assert = require('assert'),
  ampersandSyncLocalforage = require('../lib/ampersand-sync-localforage.js');

describe('ampersand-sync-localforage node module.', function() {
  it('must be awesome', function() {
    assert( ampersandSyncLocalforage .awesome(), 'awesome');
  });
});
