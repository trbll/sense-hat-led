'use strict';

let rotation = 0;

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const PNG = require('pngjs').PNG;
const varg = require('varg');
const usleep = require('sleep').usleep;

function sleep(s) {
  usleep(s * 1000000);
}

//find sense hat matrix framebuffer
const fb = findFB();

function findFB() {
  try {
    return '/dev/' +
      glob.sync('/sys/class/graphics/fb*')
      .filter(framebuffer => fs.existsSync(path.join(framebuffer, 'name')))
      .find(
        framebuffer => fs.readFileSync(path.join(framebuffer, 'name'))
        .toString().trim() === 'RPi-Sense FB'
      )
      .split('/')
      .pop();
  } catch (error) {
    throw Error('Cannot detect RPi-Sense FB device');
  }
}

// Decodes 16 bit RGB565 into array [R,G,B]
function unpack(n) {
  const r = (n & 0xF800) >> 11;
  const g = (n & 0x7E0) >> 5;
  const b = n & 0x1F;
  return [r << 3, g << 2, b << 3];
}

// Encodes array [R, G, B] into 16 bit RGB565
function pack(rgb) {
  if (rgb.length != 3) {
    throw Error(`length = ${rgb.lenth} violates length = 3`);
  }

  const r = rgb[0] >> 3 & 0x1F;
  const g = rgb[1] >> 2 & 0x3F;
  const b = rgb[2] >> 3 & 0x1F;
  return (r << 11) + (g << 5) + b;
}

//Sets the LED matrix rotation for viewing, adjust if the Pi is upside
//down or sideways. 0 is with the Pi HDMI port facing downwards
function setRotationSync(r, redraw) {
  //defaults
  if (redraw === undefined) redraw = true;

  r = checkAngle(r);

  if (!redraw) {
    rotation = r;
    return;
  }

  const pixels = getPixelsSync();
  rotation = r;
  setPixelsSync(pixels);
}

function setRotation(r, redraw, callback) {
  // defaults
  if (redraw === undefined) redraw = true;
  if (callback === undefined) callback = function () {};

  r = checkAngle(r);

  if (!redraw) {
    rotation = r;
    return callback(null);
  }

  getPixels((error, pixels) => {
    if (error) return callback(error);
    rotation = r;
    setPixels(pixels, callback);
  });
}

function checkAngle(r) {
  // defaults
  if (r === undefined) return 0;
  if (r < 0) r += 360; // negative angle for counterclockwise rotation
  if (!(r % 90 === 0 && r >= 0 && r < 360)) {
    console.error('Rotation must be 0, 90, 180 or 270 degrees');
    return rotation;
  }

  return r;
}

// Map (x, y) into rotated absolute byte position
function pos(x, y) {
  const pixMap = {
    0: (x, y) => y * 8 + x,
    90: (x, y) => y + (7 - x) * 8,
    180: (x, y) => (7 - y) * 8 + (7 - x),
    270: (x, y) => 7 - y + x * 8,
  };
  return pixMap[rotation](x, y) * 2;
}

// Returns a array of [R,G,B] representing the pixel specified by x and y
// on the LED matrix. Top left = 0,0 Bottom right = 7,7
function getPixelSync(x, y) {
  try {
    checkXY(x, y);
  } catch (error) {
    console.log(error.message);
    return;
  }

  // Two bytes per pixel in fb memory, 16 bit RGB565
  const fd = fs.openSync(fb, 'r');
  const buf = Buffer(2);
  fs.readSync(fd, buf, 0, 2, pos(x, y));
  fs.closeSync(fd);
  return unpack(buf.readUInt16LE(0));
}

function getPixel(x, y, callback) {
  callback = typeof callback === 'function' ? callback : console.log;
  try {
    checkXY(x, y);
  } catch (error) {
    return callback(error);
  }

  // Two bytes per pixel in fb memory, 16 bit RGB565
  fs.open(fb, 'r', (error, fd) => {
    fs.read(fd, Buffer(2), 0, 2, pos(x, y), (error, bytesRead, buffer) => {
      fs.close(fd);
      callback(error, unpack(buffer.readUInt16LE(0)));
    });
  });
}

function checkXY(x, y) {
  if (x < 0 || x > 7) throw Error(`x=${x} violates 0 <= x <= 7`);
  if (y < 0 || y > 7) throw Error(`y=${y} violates 0 <= y <= 7`);
}

// Updates the single [R,G,B] pixel specified by x and y on the LED matrix
// Top left = 0,0 Bottom right = 7,7
// e.g. sense.setPixel(x, y, r, g, b, callback)
// or
// pixel = [r, g, b]
// sense.setPixell(x, y, pixel, callback)
function setPixelSync(x, y, r, g, b) {
  const rgb = rgbArray(r, g, b);

  try {
    checkXY(x, y);
  } catch (error) {
    return console.error(error.messsage);
  }

  const fd = fs.openSync(fb, 'w');
  const buffer = Buffer(2);
  buffer.writeUInt16LE(pack(rgb));
  fs.writeSync(fd, buffer, 0, 2, pos(x, y));
  fs.closeSync(fd);
}

function setPixel(x, y, r, g, b, callback) {
  callback = typeof callback === 'function' ? callback : function () {};

  const rgb = rgbArray(r, g, b);

  try {
    checkXY(x, y);
  } catch (error) {
    return callback(error);
  }

  fs.open(fb, 'w', (error, fd) => {
    const buffer = Buffer(2);
    buffer.writeUInt16LE(pack(rgb));
    fs.write(fd, buffer, 0, 2, pos(x, y), (error) => {
      fs.close(fd);
      callback(error, rgb);
    });
  });
}

// Accepts a array containing 64 smaller arays of [R,G,B] pixels and
// updates the LED matrix. R,G,B elements must intergers between 0
// and 255
function setPixelsSync(pixels) {
  const buf = toBuffer(pixels);

  const fd = fs.openSync(fb, 'w');
  fs.writeSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
}

function setPixels(pixels, callback) {
  //defaults
  callback = typeof callback === 'function' ? callback : function () {};

  const buf = toBuffer(pixels);

  fs.open(fb, 'w', (error, fd) => {
    fs.write(fd, buf, 0, buf.length, 0, (error) => {
      fs.close(fd);
      callback(error, pixels);
    });
  });
}

function toBuffer(pixels) {
  if (pixels.length != 64) {
    console.error('Pixel arrays must have 64 elements');
    pixels = Array(64).fill([0, 0, 0]);
  }

  return pixels.reduce((buffer, rgb, index) => {
    const y = Math.floor(index / 8);
    const x = index % 8;
    buffer.writeUInt16LE(pack(checkColors(rgb)), pos(x, y));
    return buffer;
  }, Buffer(128)); // 8 x 8 pixels x 2 bytes
}

//  Returns a array containing 64 smaller arrays of [R,G,B] pixels
//  representing what is currently displayed on the LED matrix
function getPixelsSync() {
  const fd = fs.openSync(fb, 'r');
  const buf = fs.readFileSync(fd);
  fs.closeSync(fd);
  return bufferToPixels(buf);
}

function getPixels(callback) {
  callback = typeof callback === 'function' ? callback : console.log;
  fs.readFile(fb, (error, buffer) => {
    callback(error, bufferToPixels(buffer));
  });
}

function bufferToPixels(buffer) {
  // Two bytes per pixel in fb memory, 16 bit RGB565
  return Array.from(
    Array(64), (_, i) => unpack(buffer.readUInt16LE(pos(i % 8, Math.floor(i / 8))))
  );
}

// Clears the LED matrix with a single colour, default is black / off
// e.g. sense.clear()
// or
// sense.clear(r, g, b)
// or
// colour = [r, g, b]
// sense.clear(colour)
function clearSync(r, g, b) {
  setPixelsSync(Array(64).fill(rgbArray(r, g, b)));
}

function clear(r, g, b, callback) {
  setPixels(Array(64).fill(rgbArray(r, g, b)), callback);
}

function rgbArray(r, g, b) {
  if (Array.isArray(r)) {
    return checkColors(r);
  } else if (r === undefined && g === undefined && b === undefined) {
    return [0, 0, 0]; //default to black;
  } else {
    return checkColors([r, g, b]);
  }
}

function checkColors(rgb) {
  try {
    if (!Array.isArray(rgb)) {
      throw Error('Colors should be an rgb array');
    }

    if (rgb.length !== 3) {
      throw Error('Colors should have red green & blue values');
    }

    if (rgb.some(color => !Number.isInteger(color) || color < 0 || color > 255)) {
      throw Error(`RGB color ${rgb} violates [0, 0, 0] < RGB < [255, 255, 255]`);
    }
  } catch (error) {
    console.error(error.message);
    return [0, 0, 0]; // default to black
  }

  return rgb;
}

// Flip LED matrix horizontal
function flipHSync(redraw) {
  if (redraw === undefined) redraw = true;
  const flipped = horizontalMirror(getPixelsSync());
  if (redraw) setPixelsSync(flipped);
  return flipped;
}

function flipH(redraw, callback) {
  //defaults
  if (callback === undefined) callback = function () {};

  if (redraw === undefined) redraw = true;

  getPixels((error, pixels) => {
    if (error) return console.error(error.message);
    const flipped = horizontalMirror(pixels);
    if (redraw) {
      setPixels(flipped, callback);
    } else {
      return callback(null, flipped);
    }
  });
}

function horizontalMirror(pixels) {
  return mirrorH(pixels, Math.sqrt(pixels.length));

  function mirrorH(pixels, width) {
    if (!pixels.length) return [];
    return pixels
      .slice(0, width)
      .reverse()
      .concat(mirrorH(pixels.slice(width), width));
  }
}

// Flip LED matrix vertical
function flipVSync(redraw) {
  if (redraw === undefined) redraw = true;
  const flipped = verticalMirror(getPixelsSync());
  if (redraw) setPixelsSync(flipped);
  return flipped;
}

function flipV(redraw, callback) {
  //defaults
  if (callback === undefined) callback = function () {};

  if (redraw === undefined) redraw = true;

  getPixels((error, pixels) => {
    if (error) return console.error(error.message);
    const flipped = verticalMirror(pixels);
    if (redraw) {
      setPixels(flipped, callback);
    } else {
      return callback(null, flipped);
    }
  });
}

function verticalMirror(pixels) {
  return mirrorV(pixels, Math.sqrt(pixels.length));

  function mirrorV(pixels, width) {
    if (!pixels.length) return [];
    return pixels
      .slice(pixels.length - width)
      .concat(mirrorV(pixels.slice(0, pixels.length - width), width));
  }
}

// Text asset files are rotated right through 90 degrees to allow blocks of
// 40 contiguous pixels to represent one 5 x 8 character. These are stored
// in a 8 x 640 pixel png image with characters arranged adjacently
// Consequently we must rotate the pixel map left through 90 degrees to
// compensate when drawing text
const textAssets = 'sense_hat_text';
const letters = loadTextAssets(`${__dirname}/${textAssets}.png`, `${__dirname}/${textAssets}.txt`);

// Internal. Builds a character indexed object of pixels used by the
// show_message function below
function loadTextAssets(textImageFile, textFile) {
  const textPixels = loadImageSync(textImageFile, false);
  const loadedText = fs.readFileSync(textFile, 'utf8');

  return loadedText
    .split('')
    .reduce((letterPixels, char, i) => {
      letterPixels[char] = textPixels.slice(i * 40, ( i + 1 ) * 40); //each character is 5x8 pixels
      return letterPixels;
    }, {});
}

function isBlack(rgb) {
  return rgb.every((v) => v === 0);
}

// Internal. Trims white space pixels from the front and back of loaded
// text characters
function trimWhitespace(pixels) {
  if (pixels.every(isBlack)) return pixels;
  return trimBack(trimFront(pixels));

  function trimFront(pixels) {
    if (pixels.slice(0, 8).every(isBlack)) {
      return trimFront(pixels.slice(8));
    } else {
      return pixels;
    }
  }

  function trimBack(pixels) {
    if (pixels.slice(-8).every(isBlack)) {
      return trimBack(pixels.slice(0, -8));
    } else {
      return pixels;
    }
  }
}

function loadImageSync(filePath, redraw) {
  if (redraw === undefined) redraw = true;

  try {
    fs.accessSync(filePath);
  } catch (error) {
    throw Error(`${filePath} not found`);
  }

  //load file & convert to pixel array
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const pixels = pngTopixels(png);
  if (redraw) setPixelsSync(pixels);
  return pixels;
}

// Accepts a path to an 8 x 8 image file and updates the LED matrix with
// the image
function loadImage(filePath, redraw, callback) {
  //defaults
  if (callback === undefined) callback = function () {};

  if (redraw === undefined) redraw = true;

  fs.access(filePath, readFile);

  function readFile(error) {
    if (error) return callback(`${filePath} not found`);
    fs.readFile(filePath, parsePNG);
  }

  function parsePNG(error, buf) {
    if (error) return callback(`${filePath} could not be read`);
    new PNG().parse(buf, convertPNG);
  }

  function convertPNG(error, png) {
    if (error) return callback(`Could not parse PNG ${error.message}`);

    const pixels = pngTopixels(png);
    if (redraw) {
      setPixels(pixels, callback);
    } else {
      return callback(null, pixels);
    }
  }
}

function pngTopixels(png) {
  return Array.from(Array(png.width * png.height), (_, i) => {
    return Array.from(Array(3), (_, j) => png.data[i * 4 + j]);
  });
}

// Internal. Safeguards the character indexed object for the
// showMessage function below
function getCharPixels(character) {
  if (character.length === 1 && character in letters) {
    return letters[character];
  } else {
    return letters['?'];
  }
}

// Scrolls a string of text across the LED matrix using the specified
// speed and Colors
function showMessageSync(textString, scrollSpeed, textColor, backColor) {
  // defaults
  if (scrollSpeed === undefined) scrollSpeed = 0.1;

  const pixels = scrollpixels(textString, textColor, backColor);

  // We must rotate the pixel map left through 90 degrees when drawing
  // text, see loadTextAssets
  const previousRotation = rotation;
  rotation = (rotation + 90) % 360;

  function scroll(pixels) {
    if (pixels.length < 64) return;
    setPixelsSync(pixels.slice(0, 64));
    sleep(scrollSpeed);
    scroll(pixels.slice(8));
  }

  scroll(pixels);
  rotation = previousRotation;
}

function showMessage(textString, scrollSpeed, textColor, backColor, callback) {
  //defaults
  if (scrollSpeed === undefined) scrollSpeed = 0.1; //seconds
  if (callback === undefined) callback = function () {};

  const pixels = scrollpixels(textString, textColor, backColor);

  // We must rotate the pixel map left through 90 degrees when drawing
  // text, see loadTextAssets
  const previousRotation = rotation;
  rotation = (rotation + 90) % 360;

  function scroll(pixels) {
    if (pixels.length > 64) {
      setPixels(pixels.slice(0, 64), (error) => {
        if (error) {
          rotation = previousRotation;
          return callback(error);
        }

        setTimeout(scroll, scrollSpeed * 1000, pixels.slice(8)); // scroll(pixels.slice(8))
      });
    } else {
      rotation = previousRotation;
      return callback(null);
    }
  }

  scroll(pixels);
}

function scrollpixels(textString, textColor, backColor) {
  //defaults
  if (textColor === undefined) textColor = [255, 255, 255];
  if (backColor === undefined) backColor = [0, 0, 0];

  const stringPadding = Array(8).fill(backColor);
  const letterPadding = Array(16).fill(backColor);

  return textString.split('')
    .reduce((pixels, char) => pixels
      .concat(
        trimWhitespace(getCharPixels(char))
        .map(rgb => isBlack(rgb) ? backColor : textColor)
      )
      .concat(letterPadding),
      stringPadding
    )
    .concat(stringPadding);
}

// Displays a single text character on the LED matrix using the specified
// Colors
function showLetterSync(c, textColor, backColor) {
  if (c.length > 1) {
    console.error('Only one character may be passed into showLetter');
    return;
  }

  const pixels = letterpixels(c, textColor, backColor);

  // We must rotate the pixel map right through 90 degrees when drawing
  // text, see loadTextAssets
  const previousRotation = rotation;
  rotation = (rotation + 90) % 360;
  setPixelsSync(pixels);
  rotation = previousRotation;
}

function showLetter(c, textColor, backColor, callback) {
  //defaults
  if (callback === undefined) callback = function () {};

  if (c.length > 1) {
    callback(Error('Only one character may be passed into this showLetter'));
    return;
  }

  const pixels = letterpixels(c, textColor, backColor);

  // We must rotate the pixel map right through 90 degrees when drawing
  // text, see loadTextAssets
  const previousRotation = rotation;
  rotation = (rotation + 90) % 360;
  setPixels(pixels, (error) => {
    rotation = previousRotation;
    callback(error);
  });
}

function letterpixels(c, textColor, backColor) {
  //defaults
  if (textColor === undefined) textColor = [255, 255, 255];
  if (backColor === undefined) backColor = [0, 0, 0];

  return Array(8).fill(backColor)
    .concat(getCharPixels(c).map(rgb => isBlack(rgb) ? backColor : textColor))
    .concat(Array(16).fill(backColor));
}

function flashMessageSync(message, speed, textColor, backColor) {
  if (speed === undefined) speed = 0.5; //seconds
  message.split('')
  .forEach(char => {
    showLetterSync(char, textColor, backColor);
    sleep(speed);
  });
}

function flashMessage(textString, speed, textColor, backColor, callback) {
  //defaults
  if (speed === undefined) speed = 0.5; //seconds
  if (callback === undefined) callback = function () {};

  function flash(message) {
    if (message.length) {
      showLetter(message[0], textColor, backColor, (error) => {
        if (error) return console.error(error.message);
        setTimeout(flash, speed * 1000, message.slice(1));
      });
    } else {
      return callback(null);
    }
  }

  flash(textString);
}

module.exports = {
  clear: varg(clear),
  setPixel: varg(setPixel),
  getPixel,
  setPixels,
  getPixels,
  flipH: varg(flipH),
  flipV: varg(flipV),
  setRotation: varg(setRotation),
  showMessage: varg(showMessage),
  flashMessage: varg(flashMessage),
  showLetter: varg(showLetter),
  loadImage: varg(loadImage),
  get rotation() {
    return rotation;
  },

  set rotation(r) {
    setRotation(r, true);
  },
  sync: {
    clear: clearSync,
    getPixel: getPixelSync,
    setPixel: setPixelSync,
    getPixels: getPixelsSync,
    setPixels: setPixelsSync,
    flipH: flipHSync,
    flipV: flipVSync,
    setRotation: setRotationSync,
    showMessage: showMessageSync,
    flashMessage: flashMessageSync,
    showLetter: showLetterSync,
    loadImage: loadImageSync,
    get rotation() {
      return rotation;
    },

    set rotation(r) {
      setRotationSync(r, false);
    },
  },
};
