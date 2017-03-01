'use strict';

const {
  posXY
} = require('./rotation.js');

let pixelArray = require('/pixels_sim.js');


// Two bytes per pixel in fb memory, 16 bit RGB565
//
const getPixel = (x, y) => Promise.resolve(pixelArray[posXY(x, y)]);

const getPixels = (x, y) => Promise.resolve(pixelArray);

const setPixel = (x, y, rgb) => {
  pixelArray[posXY(x, y)] = rgb;
  return Promise.resolve();
};

const setPixels = (pixels) => {
  pixelArray = pixels;
  return Promise.resolve();
};

module.exports = require('./promise.js')(getPixel, getPixels, setPixel, setPixels);
