'use strict';

// fake sense hat matrix framebuffer
const fb = './fb-file';

const cb = require('./callback.js')(fb);
const p = require('./promise.js')(fb);
const sync = require('./sync.js')(fb);
const getAngle = require('./rotation.js').getAngle;
const gamma = require('./gamma.js');

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
