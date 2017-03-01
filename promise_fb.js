'use strict';

const fs = require('mz/fs');
const {
  posXY,
} = require('./rotation.js');

const PNG = require('pngjs').PNG;
const {
  pixelsToBuffer,
  pixelToBuffer,
  unpack,
  bufferToPixels,
} = require('./pixels.js');

module.exports = function (fd) {
  
  // Two bytes per pixel in fb memory, 16 bit RGB565
  //
  const getPixel = (x, y) =>
    fs.read(fd, Buffer.alloc(2), 0, 2, 2 * posXY(x,y))
    .then(([bytesRead, buffer]) => unpack(buffer.readUInt16LE(0)))
    .catch(console.error);
    
  const getPixels = () => fs.read(fd, Buffer.alloc(128), 0, 128, 0)
    .then(([bytesRead, buffer]) => bufferToPixels(buffer))
    .catch(console.error);

  const setPixel = (x, y, rgb) =>
    fs.write(fd, pixelToBuffer(rgb), 0, 2, 2 * posXY(x,y))
    .catch(console.error);


  const setPixels = pixels =>
    fs.write(fd, pixelsToBuffer(pixels), 0, 128, 0)
    .catch(console.error);

  return require('./promise.js')(getPixel, getPixels, setPixel, setPixels);
};
