  const {
    posXY
  } = require('./rotation.js');
  
  const updateMatrix = require('./ws.js');
  
  let pixelArray = require('/pixels_sim.js');

  const updateMatrix = () => undefined;

  // Returns a array of [R,G,B] representing the pixel specified by x and y
  // on the LED matrix. Top left = 0,0 Bottom right = 7,7
  //
  const getPixel = (x, y) => pixelArray[posXY(x, y)];

  //  Returns a array containing 64 smaller arrays of [R,G,B] pixels
  //  representing what is currently displayed on the LED matrix
  //
  const getPixels = () => pixelArray;

  // Updates the single [R,G,B] pixel specified by x and y on the LED matrix
  // Top left = 0,0 Bottom right = 7,7

  // e.g. setPixel(x, y, r, g, b)
  // or
  // pixel = [r, g, b]
  // setPixel(x, y, pixel)
  //
  const setPixel = (x, y, rgb) => {
    pixelArray[posXY(x, y)] = rgb;
    updateMatrix(pixelArray);
  };

  // Accepts a array containing 64 smaller arays of [R,G,B] pixels and
  // updates the LED matrix. R,G,B elements must intergers between 0
  // and 255
  //
  // function setPixels(pixels) {
  //   const fd = fs.openSync(fb, 'w');
  //   fs.writeSync(fd, pixelsToBuffer(pixels), 0, 128, 0);
  //   fs.closeSync(fd);
  // }
  const setPixels = pixels => {
    pixelArray = pixels;
    updateMatrix(pixelArray);
  };

  module.exports = require('./sync.js')(getPixel, getPixels, setPixel, setPixels);
  