'use strict';

const fs = require('fs');
const PNG = require('pngjs').PNG;


const pngToPixels = png =>
    Array.from({ length: png.width * png.height },
        (_, i) => Array.from({ length: 3 }, (_, j) => png.data[i * 4 + j]));


// Text asset files are rotated right through 90 degrees to allow blocks of
// 40 contiguous pixels to represent one 5 x 8 character. These are stored
// in a 8 x 640 pixel png image with characters arranged adjacently
// Consequently we must rotate the pixel map left through 90 degrees to
// compensate when drawing text
//
const textAssets = 'sense_hat_text';


const letters = loadTextAssets(`${__dirname}/${textAssets}.png`,
    `${__dirname}/${textAssets}.txt`);


// Internal. Builds a character indexed object of pixels used by the
// show_message function below
//
function loadTextAssets(textImageFile, textFile) {
    const png = PNG.sync.read(fs.readFileSync(textImageFile));

    const textPixels = pngToPixels(png);
    const loadedText = fs.readFileSync(textFile, 'utf8');

    return loadedText
        .split('')
        .reduce((letterPixels, char, i) => {
            letterPixels[char] = textPixels.slice(i * 40, (i + 1) * 40); // each character is 5x8 pixels
            return letterPixels;
        }, {});
}


// Internal. Safeguards the character indexed object for the
// showMessage function
//
const getCharPixels = char =>
    (char.length === 1 && char in letters) ?
    letters[char] :
    letters['?'];


module.exports = { pngToPixels, getCharPixels };
