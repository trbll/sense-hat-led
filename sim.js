'use strict';

const cb = require('./callback_sim.js');
const p = require('./promise_sim.js');
const sync = require('./sync_sim.js');
const getAngle = require('./rotation.js').getAngle;
const gamma = require('./gamma_sim.js');

const rotation = {
  get rotation() {
    return getAngle();
  },
  set rotation(r) {
    sync.setRotation(r, true);
  }
};

module.exports = Object.assign(cb, rotation, gamma);
module.exports.sync = Object.assign(sync, rotation, gamma);
module.exports.promise = Object.assign(p, rotation, gamma);
