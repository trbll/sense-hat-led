'use strict';

const fs = require('mz/fs');
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
const sleep = require('sleep-promise');

module.exports = function (getPixel, getPixels, setPixel, setPixels) {

  const setRotation = (r, redraw = true) => (redraw) ?
    getPixels()
    .then(pixels => {
      setAngle(r);
      return setPixels(pixels);
    })
    .catch(console.error) :
    Promise.resolve(setAngle(r));

  const clear = (r = 0, g = 0, b = 0) =>
    setPixels(Array(64).fill(rgbArray(r, g, b)));


  const flipH = (redraw = true) => getPixels()
    .then(horizontalMirror)
    .then(pixels => (redraw) ? setPixels(pixels) : pixels)
    .catch(console.error);


  const flipV = (redraw = true) => getPixels()
    .then(verticalMirror)
    .then(pixels => (redraw) ? setPixels(pixels) : pixels)
    .catch(console.error);


  // Accepts a path to an 8 x 8 image file and updates the LED matrix with
  // the image
  //
  const loadImage = (filePath, redraw = true) => fs.access(filePath)
    .then(() => fs.readFile(filePath))
    .then(buf => new Promise((resolve, reject) => {
      new PNG().parse(buf, (error, png) =>
        (error) ?
        reject(Error(`Could not parse PNG ${error.message}`)) :
        resolve(pngToPixels(png))
      );
    }))
    .then(pixels => (redraw) ?
      setPixels(checkPixelsLength(pixels))
      .then(() => pixels) :
      pixels
    ).catch(console.error);


  const whileRotated = (deg, fn) => (...args) => {
    const previousRotation = getAngle();
    setAngle((previousRotation + deg) % 360);
    return fn(...args)
      .then(value => {
        setAngle(previousRotation);
        return value;
      }, error => {
        setAngle(previousRotation);
        console.error(error);
      });
  };


  const showMessage = (message, speed = 0.1,
      textColor = [255, 255, 255],
      backColor = [0, 0, 0],
      pixels = stringPixels(message, textColor, backColor)) =>
    (pixels.length >= 64) ?
    setPixels(pixels.slice(0, 64))
    .then(sleep(speed * 1000))
    .then(() => showMessage(message, speed, textColor, backColor, pixels.slice(8))) :
    Promise.resolve();


  const showLetter = (char, textColor = [255, 255, 255], backColor = [0, 0, 0]) =>
    (typeof char === 'string' && char.length === 1) ?
    setPixels(letterPixels(char, textColor, backColor)) :
    Promise.reject(Error('Only one character may be passed into this showLetter'));


  const flashMessage = (message, speed = 0.5, textColor = [255, 255, 255],
      backColor = [0, 0, 0]) =>
    (message.length) ?
    showLetter(message[0], textColor, backColor)
    .then(sleep(speed * 1000))
    .then(flashMessage.bind(null, message.slice(1), speed, textColor, backColor)) :
    Promise.resolve();


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
