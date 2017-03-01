'use strict';

const expect = require('chai').expect;

const {
  checkColors,
  rgbArray,
  horizontalMirror,
  verticalMirror,
  isBlack,
  trimWhitespace,
  stringPixels,
  letterPixels,
  checkPixelsLength
} = require('../pixel_array.js');

describe('checkColors', function () {
  it('checks the values of an RGB array', function () {
    expect(checkColors([0, 4, 255])).to.eql([0, 4, 255]);
  });
  it('defaults to black on color values out of range 0-255', function () {
    expect(checkColors([0, 4])).to.eql([0, 0, 0]);
    expect(checkColors([300, 300, 300])).to.eql([0, 0, 0]);
  });
});

describe('rgbArray', function () {
  it('groups color values into an RGB array', function () {
    expect(rgbArray(1, 2, 3)).to.eql([1, 2, 3]);
    expect(rgbArray([1, 2, 3])).to.eql([1, 2, 3]);
  });
});

const x = [248, 248, 248]; // white
const _ = [0, 0, 0]; // black

const L = [
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, _, _, _, _, _, _, _,
  x, x, x, x, x, x, x, x
];


describe('horizontalMirror', function () {
  it('mirrors a pixel array on the horizontal axis', function () {
    expect(horizontalMirror(L)).to.eql([_, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        _, _, _, _, _, _, _, x,
                                        x, x, x, x, x, x, x, x]);
  });
});


describe('verticalMirror', function () {
  it('mirrors a pixel array on the vertical axis', function () {
    expect(verticalMirror(L)).to.eql([x, x, x, x, x, x, x, x,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _,
                                      x, _, _, _, _, _, _, _]);
  });
});


describe('isBlack', function () {
  it('checks if all pixels in the array are black', function () {
    expect(isBlack(_)).to.equal(true);
    expect(isBlack(x)).to.equal(false);
    expect(isBlack([0, 1, 0])).to.equal(false);
  });
});

describe('trimWhitespace', function () {
  it('remove any rows of whitespace from the top or bottom of a pixel array', function () {
    expect(trimWhitespace(
      [_, _, _, _, _, _, _, _,
       _, x, _, _, _, _, _, _,
       x, _, x, _, x, _, _, _,
       x, _, x, _, x, _, _, _,
       x, _, x, _, x, _, _, _,
       x, x, x, x, _, _, _, _,
       _, _, _, _, _, _, _, _,
       _, _, _, _, _, _, _, _]
    )).to.eql(
      [_, x, _, _, _, _, _, _,
       x, _, x, _, x, _, _, _,
       x, _, x, _, x, _, _, _,
       x, _, x, _, x, _, _, _,
       x, x, x, x, _, _, _, _]);
  });
});


describe('letterPixels', function () {
  it('outputs a 8x8 pixel array for a inputted character', function () {
    expect(letterPixels('a', x, _)).to.eql(
     [_, _, _, _, _, _, _, _, // padding
      _, x, _, _, _, _, _, _,
      x, _, x, _, x, _, _, _,
      x, _, x, _, x, _, _, _,
      x, _, x, _, x, _, _, _,
      x, x, x, x, _, _, _, _,
      _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _]); // padding

    expect(letterPixels('L', x, _)).to.eql(
     [_, _, _, _, _, _, _, _,
      x, x, x, x, x, x, x, _,
      x, _, _, _, _, _, _, _,
      x, _, _, _, _, _, _, _,
      x, _, _, _, _, _, _, _,
      x, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _]);
  });
});

describe('stringPixels', function () {
  it('outputs a pixel array for a inputted string', function () {
    expect(stringPixels('a', x, _)).to.eql(
      [_, _, _, _, _, _, _, _, // string padding
       _, x, _, _, _, _, _, _, //--
       x, _, x, _, x, _, _, _, // |
       x, _, x, _, x, _, _, _, // |-- trimmed character
       x, _, x, _, x, _, _, _, // |
       x, x, x, x, _, _, _, _, //--
       _, _, _, _, _, _, _, _, // letter padding
       _, _, _, _, _, _, _, _, // letter padding
       _, _, _, _, _, _, _, _]); // String padding

    expect(stringPixels('aL', x, _)).to.eql(
     [_, _, _, _, _, _, _, _, // string padding
      _, x, _, _, _, _, _, _, //--
      x, _, x, _, x, _, _, _, // |
      x, _, x, _, x, _, _, _, // |-- trimmed character
      x, _, x, _, x, _, _, _, // |
      x, x, x, x, _, _, _, _, //--
      _, _, _, _, _, _, _, _, // letter padding
      _, _, _, _, _, _, _, _, // letter padding
      x, x, x, x, x, x, x, _, //--
      x, _, _, _, _, _, _, _, // |
      x, _, _, _, _, _, _, _, // |--trimmed letter
      x, _, _, _, _, _, _, _, // |
      x, _, _, _, _, _, _, _, //--
      _, _, _, _, _, _, _, _, // letter padding
      _, _, _, _, _, _, _, _, // letter padding
      _, _, _, _, _, _, _, _]); // string padding
  });
});

describe('checkPixelsLength', function () {
  it('makes sure that a pixel array is 8x8=64 length', function () {
    expect(checkPixelsLength(L)).to.eql(L);
    expect(checkPixelsLength(L.slice(0, -1))).to.eql(Array(64).fill([0, 0, 0]));
    expect(checkPixelsLength([255, 255, 255])).to.eql(Array(64).fill([0, 0, 0]));
  });
});
