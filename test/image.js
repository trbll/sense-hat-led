'use strict';

const expect = require('chai').expect;

const {
  pngToPixels,
  getCharPixels,
} = require('../image.js');
const PNG = require('pngjs').PNG;
const fs = require('fs');

const X = [255, 255, 255]; // white
const _ = [0, 0, 0]; // black

describe('getCharPixels', function () {
  it('outputs a pixel array for a inputted character', function () {
    expect(getCharPixels('a')).to.eql([_, X, _, _, _, _, _, _,
                                       X, _, X, _, X, _, _, _,
                                       X, _, X, _, X, _, _, _,
                                       X, _, X, _, X, _, _, _,
                                       X, X, X, X, _, _, _, _]);

    expect(getCharPixels('L')).to.eql([X, X, X, X, X, X, X, _,
                                       X, _, _, _, _, _, _, _,
                                       X, _, _, _, _, _, _, _,
                                       X, _, _, _, _, _, _, _,
                                       X, _, _, _, _, _, _, _]);
  });
});


describe('pngToPixels', function () {
  it('reads a png file and converts it to a pixel array', function () {
    const G = [60, 255, 0];
    const spaceInvader = PNG.sync.read(fs.readFileSync('./test/space_invader.png'));
    
    expect(pngToPixels(spaceInvader)).to.eql(
     [_, _, _, G, G, _, _, _,
      _, _, G, G, G, G, _, _,
      _, G, G, G, G, G, G, _,
      G, G, _, G, G, _, G, G,
      G, G, G, G, G, G, G, G,
      _, _, G, _, _, G, _, _,
      _, G, _, G, G, _, G, _,
      G, _, G, _, _, G, _, G]);
  });
});
