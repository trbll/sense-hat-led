'use strict';
const cursor = require('ansi')(process.stdout);

const usleep = require('sleep').usleep;
const fs = require('fs');
const {
  pos,
  rotate,
  getAngle,
  setAngle
} = require('./rotation.js');
const {
  loadPng
} = require('./image.js');
const {
  pixelsToBuffer,
  pixelToBuffer,
  unpack,
  rgbArray,
  horizontalMirror,
  verticalMirror,
  stringPixels,
  letterPixels,
  bufferToPixels,
  checkPixelsLength,
  checkColors
} = require('./pixel-array.js');



module.exports = function (fb) {

  function sleep(s) {
    usleep(s * 1000000);
  }


  // Sets the LED matrix rotation for viewing, adjust if the Pi is upside
  // down or sideways. 0 is with the Pi HDMI port facing downwards
  //
  function setRotation(r, redraw = true) {
    if (!redraw) return setAngle(r);

    const pixels = getPixels();
    setAngle(r);
    setPixels(pixels);
  }


  // Returns a array of [R,G,B] representing the pixel specified by x and y
  // on the LED matrix. Top left = 0,0 Bottom right = 7,7
  //
  function getPixel(x, y) {
    // Two bytes per pixel in fb memory, 16 bit RGB565
    const fd = fs.openSync(fb, 'r');
    const buf = Buffer.alloc(2);
    fs.readSync(fd, buf, 0, 2, pos(x, y));
    fs.closeSync(fd);
    return unpack(buf.readUInt16LE(0));
  }


  //  Returns a array containing 64 smaller arrays of [R,G,B] pixels
  //  representing what is currently displayed on the LED matrix
  //
  function getPixels() {
    return bufferToPixels(fs.readFileSync(fb));
  }


  // Updates the single [R,G,B] pixel specified by x and y on the LED matrix
  // Top left = 0,0 Bottom right = 7,7
  // e.g. setPixel(x, y, r, g, b)
  // or
  // pixel = [r, g, b]
  // setPixel(x, y, pixel)
  //
  function setPixel(x, y, rgb) {
    const fd = fs.openSync(fb, 'w');
    fs.writeSync(fd, pixelToBuffer(rgb), pos(x, y));
    fs.closeSync(fd);
  }



  // Accepts a array containing 64 smaller arays of [R,G,B] pixels and
  // updates the LED matrix. R,G,B elements must intergers between 0
  // and 255
  //
  // function setPixels(pixels) {
  //   const fd = fs.openSync(fb, 'w');
  //   fs.writeSync(fd, pixelsToBuffer(pixels), 0, 128, 0);
  //   fs.closeSync(fd);
  // }
  function setPixels(pixels) {
    fs.writeFileSync(fb, pixelsToBuffer(pixels));
    //ctx.clear();
    pixels.forEach((pixel, i) => {
      const {
        x,
        y
      } = rotate(i % 8, Math.floor(i / 8));
      cursor.bg.reset()
        .goto(x * 2 + 1, y + 1)
        .bg.rgb(...pixel)
        .write('  ');
    });
    //ctx.cursor.restore();
  }


  // Clears the LED matrix with a single colour, default is black / off
  // e.g. sense.clear()
  // or
  // sense.clear(r, g, b)
  // or
  // colour = [r, g, b]
  // sense.clear(colour)
  //
  function clear(r = 0, g = 0, b = 0) {
    setPixels(Array(64).fill(rgbArray(r, g, b)));
  }


  // Flip LED matrix horizontal
  //
  function flipH(redraw = true) {
    const flipped = horizontalMirror(getPixels());
    if (redraw) setPixels(flipped);
    return flipped;
  }


  // Flip LED matrix vertical
  //
  function flipV(redraw = true) {
    const flipped = verticalMirror(getPixels());
    if (redraw) setPixels(flipped);
    return flipped;
  }


  // Accepts a path to an 8 x 8 image file and updates the LED matrix with
  // the image
  //
  function loadImage(filePath, redraw = true) {
    try {
      fs.accessSync(filePath);
    } catch (error) {
      console.error(`${filePath} not found`, error.message);
    }

    // load file & convert to pixel array
    try {
      const pixels = loadPng(filePath);
      if (redraw) setPixels(checkPixelsLength(pixels));
      return pixels;
    } catch (error) {
      console.error(`${filePath} could not be read`, error.message);
    }
    return Array(64).fill[0, 0, 0];
  }


  // We must rotate the pixel map left through 90 degrees when drawing
  // text, see loadTextAssets
  //
  const whileRotated = (deg, fn) => (...args) => {
    const previousRotation = getAngle();
    setAngle((previousRotation + deg) % 360);
    fn(...args);
    setAngle(previousRotation);
  };


  // Scrolls a string of text across the LED matrix using the specified
  // speed and Colors
  //
  const showMessage = (message, scrollSpeed = 0.1,
    textColor = [255, 255, 255], backColor = [0, 0, 0],
    pixels = stringPixels(message, textColor, backColor)) => {
    if (pixels.length < 64) return;
    setPixels(pixels.slice(0, 64));
    sleep(scrollSpeed);
    showMessage(message, scrollSpeed, textColor, backColor, pixels.slice(8));
  };


  // Displays a single text character on the LED matrix using the specified
  // Colors
  //
  const showLetter = (char, textColor = [255, 255, 255], backColor = [0, 0, 0]) =>
    (typeof char === 'string' && char.length === 1) ?
    setPixels(letterPixels(char, textColor, backColor)) :
    console.error('Only a one character string may be passed into showLetter');


  // Flash a string on the LED matrix one character at a time
  //
  const flashMessage = (message, speed = 0.5,
      textColor = [255, 255, 255], backColor = [0, 0, 0]) =>
    message.split('')
    .forEach(char => {
      setPixels(letterPixels(char, textColor, backColor));
      sleep(speed);
    });


  return {
    sleep,
    setRotation,
    getPixel,
    setPixel: (x, y, r, g, b) => setPixel(x, y, rgbArray(r, g, b)),
    setPixels: pixels => setPixels(checkPixelsLength(pixels).map(checkColors)),
    clear,
    flipH,
    flipV,
    loadImage,
    showMessage: whileRotated(90, showMessage),
    showLetter: whileRotated(90, showLetter),
    flashMessage: whileRotated(90, flashMessage)
  };
};
