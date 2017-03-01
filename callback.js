'use strict';

const fs = require('fs');
const { 
  getAngle, 
  setAngle } = require('./rotation.js');
const { pngToPixels } = require('./image.js');
const PNG = require('pngjs').PNG;
const {
  checkColors,
  rgbArray,
  horizontalMirror,
  verticalMirror,
  stringPixels,
  letterPixels,
  checkPixelsLength
} = require('./pixel_array.js');


module.exports = function (getPixel, getPixels, setPixel, setPixels) {

  const noop = error => {
    if (error) console.error(error);
  };


  const log = (error, data) => (error) ?
    console.error(error) :
    console.log(data);


  const setRotation = (r, redraw = true, callback = noop) => {
    if (!redraw) {
      setAngle(r);
      return callback(null);
    }
    getPixels((error, pixels) => {
      setAngle(r);
      if (error) return callback(error);
      setPixels(pixels, callback);
    });
  };


  // Clears the LED matrix with a single colour, default is black / off
  // e.g. sense.clear()
  // or
  // sense.clear(r, g, b)
  // or
  // colour = [r, g, b]
  // sense.clear(colour)
  //
  const clear = (rgb, callback = noop) =>
    setPixels(Array(64).fill(rgb), callback);


  // Flip LED matrix horizontal
  //
  const flipH = (redraw = true, callback = log) =>
    getPixels((error, pixels) =>
      (error) ?
      callback(error) :
      ((redraw) ?
        setPixels(horizontalMirror(pixels), callback) :
        callback(null, horizontalMirror(pixels))
      ));


  // Flip LED matrix vertical
  //
  const flipV = (redraw = true, callback = log) =>
    getPixels((error, pixels) =>
      (error) ?
      callback(error) :
      ((redraw) ?
        setPixels(verticalMirror(pixels), callback) :
        callback(null, verticalMirror(pixels))
      ));


  // Accepts a path to an 8 x 8 image file and updates the LED matrix with
  // the image
  //
  const loadImage = (filePath, redraw = true, callback = log) =>
    fs.access(filePath, error =>
      (error) ?
      callback(Error(`${filePath} not found`)) :
      fs.readFile(filePath, (error, buf) =>
        (error) ?
        callback(Error(`${filePath} could not be read`)) :
        new PNG().parse(buf, (error, png) =>
          (error) ?
          callback(Error(`Could not parse PNG ${error.message}`)) :
          ((redraw) ?
            setPixels(checkPixelsLength(pngToPixels(png)), callback) :
            callback(null, pngToPixels(png))
          )
        )
      )
    );


  const varg = (fn, arity) => (...args) => {
    if (typeof args[arity - 1] === 'function') return fn(...args.slice(0, arity));
    args = args.slice(0, arity - 1);
    return (typeof args[args.length - 1] === 'function') ?
      fn(...args.slice(0, -1), ...new Array(arity - args.length).fill(undefined), args[args.length - 1]) :
      fn(...args, ...new Array(arity - args.length).fill(undefined));
  };


  // We must rotate the pixel map right through 90 degrees when drawing
  // text, see loadTextAssets
  const whileRotated = (deg, fn) => (...args) => {
    const previousRotation = getAngle();
    setAngle((previousRotation + deg) % 360);
    const callback = args[args.length - 1];
    return fn(...args.slice(0, -1), (error, data) => {
      setAngle(previousRotation);
      callback(error, data);
    });
  };


  // Scrolls a string of text across the LED matrix using the specified
  // speed and Colors
  //
  const showMessage = (
      message,
      speed = 0.1,
      textColor = [255, 255, 255],
      backColor = [0, 0, 0],
      callback,
      pixels = stringPixels(message, textColor, backColor)) =>
    (pixels.length >= 64) ?
    setPixels(pixels.slice(0, 64), error =>
      (error) ?
      callback(error) :
      setTimeout(showMessage, speed * 1000, message, speed, textColor,
        backColor, callback, pixels.slice(8))
    ) :
    callback(null);


  // Displays a single text character on the LED matrix using the specified
  // Colors
  //
  const showLetter = (
      char,
      textColor = [255, 255, 255],
      backColor = [0, 0, 0],
      callback = noop) =>
    (char.length !== 1) ?
    callback(Error('Only one character may be passed into this showLetter')) :
    setPixels(letterPixels(char, textColor, backColor), callback);


  // Flash a string on the LED matri one character at a time
  //
  const flashMessage = (
      message,
      speed = 0.1,
      textColor = [255, 255, 255],
      backColor = [0, 0, 0],
      callback = noop) =>
    (!message.length) ?
    callback(null) :
    showLetter(message[0], textColor, backColor, error =>
      (error) ?
      callback(error) :
      setTimeout(flashMessage, speed * 1000, message.slice(1), speed,
        textColor, backColor, callback)
    );


  return {
    varg,
    clear: varg((r = [0, 0, 0], g, b, callback) => clear(rgbArray(r, g, b), callback), 4),
    setPixel: varg((x, y, r, g, b, callback) => setPixel(x, y, rgbArray(r, g, b), callback), 6),
    getPixel: getPixel,
    setPixels: (pixels, callback) => setPixels(checkPixelsLength(pixels).map(checkColors), callback),
    getPixels: getPixels,
    flipH: varg(flipH, 2),
    flipV: varg(flipV, 2),
    setRotation: varg(setRotation, 3),
    showMessage: varg(whileRotated(90, showMessage), 5),
    flashMessage: varg(whileRotated(90, flashMessage), 5),
    showLetter: varg(whileRotated(90, showLetter), 4),
    loadImage: varg(loadImage, 3)
  };
};