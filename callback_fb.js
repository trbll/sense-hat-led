'use strict';

const fs = require('fs');
const {
  posXY
} = require('./rotation.js');
const PNG = require('pngjs').PNG;
const {
  pixelsToBuffer,
  bufferToPixels,
  pixelToBuffer,
  bufferToPixel,
} = require('./pixels.js');


module.exports = function(fd) {
  
  const noop = error => {
    if (error) console.error(error);
  };


  const log = (error, data) => (error) ?
    console.error(error) :
    console.log(data);


  const getPixel = (x, y, callback = log) =>
    // Two bytes per pixel in fb memory, 16 bit RGB565
    fs.read(fd, Buffer.alloc(2), 0, 2, 2 * posXY(x, y), (error, bytesRead, buffer) =>
      (error) ?
      callback(error) :
      callback(null, bufferToPixel(buffer))
    );


  //  Returns a array containing 64 smaller arrays of [R,G,B] pixels
  //  representing what is currently displayed on the LED matrix
  //
  const getPixels = (callback = log) =>
    fs.read(fd, Buffer.alloc(128), 0, 128, 0, (error, bytesRead, buffer) =>
      (error) ?
      callback(error) :
      callback(null, bufferToPixels(buffer))
    );


  // Updates the single [R,G,B] pixel specified by x and y on the LED matrix
  // Top left = 0,0 Bottom right = 7,7
  // e.g. sense.setPixel(x, y, r, g, b, callback)
  // or
  // pixel = [r, g, b]
  // sense.setPixel(x, y, pixel, callback)
  //
  const setPixel = (x, y, rgb, callback = noop) =>
    fs.write(fd, pixelToBuffer(rgb), 0, 2, 2 * posXY(x, y), callback);


  // Accepts a array containing 64 smaller arays of [R,G,B] pixels and
  // updates the LED matrix. R,G,B elements must intergers between 0
  // and 255
  //
  const setPixels = (pixels, callback = noop) =>
    fs.write(fd, pixelsToBuffer(pixels), 0, 128, 0, error =>
      callback(error, pixels)
    );

  return require('./callback.js')(getPixel, getPixels, setPixel, setPixels);
};
