'use strict';

const expect = require('chai').expect;

const {
  pixelsToBuffer,
  pixelToBuffer,
  unpack,
  pack,
  bufferToPixels
} = require('../pixels.js');

const randInt = max => Math.floor(Math.random() * max + 1);

describe('pack', function () {
  it('Encodes array [R, G, B] into 16 bit RGB565', function () {
    expect(pack([0, 0, 0])).to.equal(0);
    expect(pack([8, 8, 8])).to.equal(2113);
    expect(pack([255, 255, 255])).to.equal(65535);
  });
  it('is reversable', function () {
    const rgb = [randInt(255) >> 3 << 3,
    randInt(255) >> 2 << 2,
    randInt(255) >> 3 << 3];
    expect(unpack(pack(rgb))).to.eql(rgb);
  });
});

describe('unpack', function () {
  it('Decodes 16 bit RGB565 into array [R,G,B]', function () {
    expect(unpack(0)).to.eql([0, 0, 0]);
    expect(unpack(2113)).to.eql([8, 8, 8]);
    expect(unpack(65535)).to.eql([248, 252, 248]);
  });
  it('is reversable', function () {
    const rgb565 = randInt(65535);
    expect(pack(unpack(rgb565))).to.equal(rgb565);
  });
});

const black = Buffer.from(Array(128).fill(0));

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

describe('pixelsToBuffer', function () {
  it('converts a pixel array to a buffer', function () {
    expect(black.compare(pixelsToBuffer(Array(64).fill([0, 0, 0])))).to.eql(0);
  });
  it('returns a 128 byte buffer', function () {
    expect(Buffer.isBuffer(pixelsToBuffer(L))).to.equal(true);
    expect(Buffer.byteLength(pixelsToBuffer(L))).to.equal(128);
  });
  it('is reversable', function () {
    expect(bufferToPixels(pixelsToBuffer(L))).to.eql(L);
  });
});

describe('pixelToBuffer', function () {
  it('converts a RGB array to a buffer', function () {
    expect(unpack(pixelToBuffer([248, 252, 248]).readUInt16LE(0))).to.eql([248, 252, 248]);
  });
  it('returns a 2 byte buffer', function () {
    expect(Buffer.isBuffer(pixelToBuffer([248, 252, 248]))).to.equal(true);
    expect(Buffer.byteLength(pixelToBuffer([248, 252, 248]))).to.equal(2);
  });
});
