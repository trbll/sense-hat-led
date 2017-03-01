'use strict';
const sense = require('sense-hat-led');

const sleep = sense.sync.sleep;

const X = [248, 248, 248]; // black
const O = [0, 0, 0]; // White

const arrow = [
  O, O, O, O, X, O, O, O,
  O, O, O, O, X, X, O, O,
  O, O, O, O, X, X, X, O,
  O, O, O, O, X, X, X, X,
  O, O, O, O, X, O, O, O,
  O, O, O, O, X, O, O, O,
  O, O, O, O, X, O, O, O,
  O, O, O, O, X, O, O, O
];

const G = [56, 252, 0];

const si = [
  O, O, O, G, G, O, O, O,
  O, O, G, G, G, G, O, O,
  O, G, G, G, G, G, G, O,
  G, G, O, G, G, O, G, G,
  G, G, G, G, G, G, G, G,
  O, O, G, O, O, G, O, O,
  O, G, O, G, G, O, G, O,
  G, O, G, O, O, G, O, G,
];

let lst = ' +-*/!"#$><0123456789.=)(ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?,;:|@%[&_\']\~';
let abc = 'abcdefghijklmnopqrstuvwxyz';

let t = 0.2;

sense.sync.clear();
sense.sync.setRotation(180);


sense.sync.showMessage(lst, t / 10);
sleep(t);

const B = [248, 252, 248];

const A = [
  O, O, O, O, O, O, O, O,
  O, O, B, B, B, O, O, O,
  O, B, O, O, O, B, O, O,
  O, B, O, O, O, B, O, O,
  O, B, B, B, B, B, O, O,
  O, B, O, O, O, B, O, O,
  O, B, O, O, O, B, O, O,
  O, B, O, O, O, B, O, O,
];

sense.sync.showLetter('A');
sleep(t);
sense.sync.flashMessage(abc, t);
sense.sync.clear();
sense.sync.setRotation(0);
sleep(t);
sense.sync.setPixels(arrow);
sleep(t);
sense.sync.flipV();
sleep(t);
sense.sync.flipV();
sleep(t);
sense.sync.flipH();
sleep(t);
sense.sync.flipH();
sleep(t);
sense.sync.setRotation(90);
sleep(t);
sense.sync.setRotation(180);
sleep(t);
sense.sync.setRotation(270);
sleep(t);
sense.sync.setRotation(0);
sleep(t);
sense.sync.rotation = 90;
sleep(t);
sense.sync.rotation = 180;
sleep(t);
sense.sync.rotation = 270;
sleep(t);
sense.sync.rotation = 0;

sleep(t);
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    sense.sync.setPixel(x, y, [248 - (x * 32), 248 - (y * 32), 248 - (x + y) * 16]);
  }
}



sleep(t);
sense.sync.clear();
sense.sync.rotation = 180;

sense.sync.loadImage('./space_invader.png');
sleep(t);

sense.sync.clear(255, 255, 255);
sense.sync.lowLight = true;
sense.sync.sleep(t);
sense.sync.lowLight = false;
sense.sync.clear(255, 127, 0);

sense.sync.sleep(t);
sense.sync.gamma = sense.sync.gamma.reverse();
sense.sync.sleep(t);
sense.sync.lowLight = true;
sense.sync.sleep(t);
sense.low_light = false;

sense.sync.clear(255, 127, 0);
sense.sync.sleep(t);
sense.sync.gamma = new Array(32).fill(0); // Will turn the LED matrix off
sense.sync.sleep(t);
sense.sync.gammaReset();


var async = require("async");

let timeout = (callback) => setTimeout(callback, t * 1000);

async.series(
  [(callback) => sense.clear(255, 0, 0, callback),
    timeout,
    sense.clear,
    (callback) => sense.setRotation(180, true, callback),
    (callback) => sense.showMessage(lst, t / 10, callback),
    sense.clear,
    (callback) => sense.showLetter('A', callback),
    (callback) => sense.getPixels((error, pixelList) => {
      if (error) console.error(error.message);
      callback();
    }),
    timeout,
    sense.clear,
    (callback) => sense.flashMessage(abc, t, callback),
    timeout,
    sense.clear,
    (callback) => sense.setRotation(0, callback),
    (callback) => sense.setPixels(arrow, callback),
    timeout,
    sense.flipV,
    timeout,
    sense.flipV,
    (callback) => sense.getPixels((error, pixelList) => {
      if (error) console.error(error.message);
      callback();
    }),
    timeout,
    sense.flipH,
    timeout,
    sense.flipH,
    (callback) => sense.getPixels((error, pixelList) => {
      if (error) console.error(error.message);
      callback();
    }),
    timeout,
    (callback) => sense.setRotation(90, callback),
    (callback) => {
      callback();
    },
    timeout,
    (callback) => sense.setRotation(180, callback),
    (callback) => {
      callback();
    },
    timeout,
    (callback) => sense.setRotation(270, callback),
    (callback) => {
      callback();
    },
    timeout,
    (callback) => sense.setRotation(0, callback),
    timeout,
    (callback) => {
      function fill(x, y) {
        if (x === 8) {
          x = 0;
          y++;
        }
        if (y === 8) return callback();
        sense.setPixel(x, y, [248 - (x * 32), 248 - (y * 32), 248 - (x + y) * 16], () => fill(x + 1, y));
      }
      fill(0, 0);
    },
    timeout,
    (callback) => sense.setRotation(180, false, callback),
    (callback) => sense.loadImage('./space_invader.png', true, callback),
    sense.clear
  ]
);
