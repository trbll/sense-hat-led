'use strict';
const {
  posXY
} = require('./rotation.js');

let pixelArray = require('/pixels_sim.js');

const noop = error => {
  if (error) console.error(error);
};

const log = (error, data) => (error) ?
  console.error(error) :
  console.log(data);


// Returns a array of [R,G,B] representing the pixel specified by x and y
// on the LED matrix. Top left = 0,0 Bottom right = 7,7
//
const getPixel = (x, y, callback = log) => callback(null, pixelArray[posXY(x, y)]);


//  Returns a array containing 64 smaller arrays of [R,G,B] pixels
//  representing what is currently displayed on the LED matrix
//
const getPixels = (callback = log) => callback(null, pixelArray);


// Updates the single [R,G,B] pixel specified by x and y on the LED matrix
// Top left = 0,0 Bottom right = 7,7
// e.g. sense.setPixel(x, y, r, g, b, callback)
// or
// pixel = [r, g, b]
// sense.setPixel(x, y, pixel, callback)
//
const setPixel = (x, y, rgb, callback = noop) => {
  pixelArray[posXY(x, y)] = rgb;
  return callback(null);
};


// Accepts a array containing 64 smaller arays of [R,G,B] pixels and
// updates the LED matrix. R,G,B elements must intergers between 0
// and 255
//
const setPixels = (pixels, callback = noop) => {
  pixelArray = pixels;
  return callback(null);
};

module.exports = require('./callback.js')(getPixel, getPixels, setPixel, setPixels);
