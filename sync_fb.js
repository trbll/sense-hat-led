  const fs = require('fs');
  const {
    posXY
  } = require('./rotation.js');
  const {
    pixelsToBuffer,
    pixelToBuffer,
    unpack,
    bufferToPixels,
  } = require('./pixels.js');

  module.exports = function(fd) {

    // Returns a array of [R,G,B] representing the pixel specified by x and y
    // on the LED matrix. Top left = 0,0 Bottom right = 7,7
    //
    function getPixel(x, y) {
      // Two bytes per pixel in fb memory, 16 bit RGB565
      const buf = Buffer.alloc(2);
      fs.readSync(fd, buf, 0, 2, 2 * posXY(x, y));
      return unpack(buf.readUInt16LE(0));
    }


    //  Returns a array containing 64 smaller arrays of [R,G,B] pixels
    //  representing what is currently displayed on the LED matrix
    //
    function getPixels() {
      const buf = Buffer.alloc(128);
      fs.readSync(fd, buf, 0, 128, 0);
      return bufferToPixels(buf);
    }


    // Updates the single [R,G,B] pixel specified by x and y on the LED matrix
    // Top left = 0,0 Bottom right = 7,7
    // e.g. setPixel(x, y, r, g, b)
    // or
    // pixel = [r, g, b]
    // setPixel(x, y, pixel)
    //
    const setPixel = (x, y, rgb) =>
      fs.writeSync(fd, pixelToBuffer(rgb), 0, 2, 2 * posXY(x, y));


    // Accepts a array containing 64 smaller arays of [R,G,B] pixels and
    // updates the LED matrix. R,G,B elements must intergers between 0
    // and 255
    //
    // function setPixels(pixels) {
    //   const fd = fs.openSync(fb, 'w');
    //   fs.writeSync(fd, pixelsToBuffer(pixels), 0, 128, 0);
    //   fs.closeSync(fd);
    // }
    const setPixels = pixels =>
      fs.writeSync(fd, pixelsToBuffer(pixels), 0, 128, 0);

    return require('./sync.js')(getPixel, getPixels, setPixel, setPixels);
  };
  