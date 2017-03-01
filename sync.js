'use strict';

const usleep = require('sleep').usleep;
const fs = require('fs');
const {
  getAngle,
  setAngle
} = require('./rotation.js');
const {
  pngToPixels
} = require('./image.js');
const PNG = require('pngjs').PNG;
const {
  rgbArray,
  horizontalMirror,
  verticalMirror,
  stringPixels,
  letterPixels,
  checkPixelsLength,
  checkColors
} = require('./pixel_array.js');


module.exports = function(getPixel, getPixels, setPixel, setPixels) {

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


  // Clears the LED matrix with a single colour, default is black / off
  // e.g. sense.clear()
  // or
  // sense.clear(r, g, b)
  // or
  // colour = [r, g, b]
  // sense.clear(colour)
  //
  const clear = (r = 0, g = 0, b = 0) =>
    setPixels(Array(64).fill(rgbArray(r, g, b)));


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
    }
    catch (error) {
      console.error(`${filePath} not found`, error.message);
    }

    // load file & convert to pixel array
    try {
      const png = PNG.sync.read(fs.readFileSync(filePath));
      const pixels = pngToPixels(png);
      if (redraw) setPixels(checkPixelsLength(pixels));
      return pixels;
    }
    catch (error) {
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
    if (pixels.length >= 64) {
      setPixels(pixels.slice(0, 64));
      sleep(scrollSpeed);
      showMessage(message, scrollSpeed, textColor, backColor, pixels.slice(8));
    }
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
    getPixels,
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
