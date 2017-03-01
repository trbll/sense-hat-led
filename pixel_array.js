'use strict';

const { getCharPixels } = require('./image.js');


const checkPixelsLength = pixels =>
    (Array.isArray(pixels) && pixels.length === 64) ?
    pixels : (
        console.error('Pixel arrays must have 64 elements'),
        new Array(64).fill([0, 0, 0])
    );


const rgbArray = (r, g, b) => (Array.isArray(r)) ?
    checkColors(r) :
    checkColors([r, g, b]);


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


const horizontalMirror = (pixels, width = Math.sqrt(pixels.length)) =>
    (!pixels.length) ? [] :
    pixels
    .slice(0, width)
    .reverse()
    .concat(horizontalMirror(pixels.slice(width), width));


const verticalMirror = (pixels, width = Math.sqrt(pixels.length)) =>
    (!pixels.length) ? [] :
    pixels
    .slice(pixels.length - width)
    .concat(verticalMirror(pixels.slice(0, pixels.length - width), width));


const isBlack = rgb => rgb.every(v => v === 0);


// Internal. Trims white space pixels from the front and back of loaded
// text characters
//
const trimFront = pixels =>
    (pixels.slice(0, 8).every(isBlack)) ?
    trimFront(pixels.slice(8)) :
    pixels;

const trimBack = pixels =>
    (pixels.slice(-8).every(isBlack)) ?
    trimBack(pixels.slice(0, -8)) :
    pixels;

const trimWhitespace = pixels =>
    (pixels.every(isBlack)) ?
    pixels :
    trimBack(trimFront(pixels));

const stringPadding = color => Array(8).fill(color);
const letterPadding = color => Array(16).fill(color);

const stringPixels = (textString, textColor, backColor) =>
    textString.split('')
    .reduce((pixels, char) => pixels
        .concat(
            trimWhitespace(getCharPixels(char))
            .map(rgb => isBlack(rgb) ? backColor : textColor),
            letterPadding(backColor)
        ),
        stringPadding(backColor)
    )
    .concat(stringPadding(backColor));


const letterPixels = (char, textColor, backColor) =>
    stringPadding(backColor)
    .concat(getCharPixels(char).map(rgb => isBlack(rgb) ? backColor : textColor),
        letterPadding(backColor));


module.exports = {
    checkColors,
    rgbArray,
    horizontalMirror,
    verticalMirror,
    isBlack,
    trimWhitespace,
    stringPixels,
    letterPixels,
    checkPixelsLength
};
