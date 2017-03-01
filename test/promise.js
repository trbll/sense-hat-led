'use strict';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const fs = require('fs');
const fd = fs.openSync('./test/test_fb', 'w+');

const {
    setRotation,
    getPixel,
    getPixels,
    setPixel,
    setPixels,
    clear,
    flipH,
    flipV,
    loadImage,
    showMessage,
    showLetter,
    flashMessage
} = require('../promise_fb.js')(fd);

const {
    getAngle
} = require('../rotation.js');

const x = [248, 252, 248]; // white
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

const black = new Array(64).fill([0, 0, 0]);

describe('setRotation', function () {
    it('sets the rotation and redisplays', function () {
        setRotation(90, false);
        expect(getAngle()).to.equal(90);
        setRotation(270, false);
        expect(getAngle()).to.equal(270);
        setRotation(180, false);
        expect(getAngle()).to.equal(180);
        setRotation(-90, false);
        expect(getAngle()).to.equal(270);
        setRotation(2, false);
        expect(getAngle()).to.equal(270);
        setRotation(0, false);
    });
});

describe('setPixel', function () {
    before(function () {
        return clear();
    });

    it('sets specified x, y pixel to the specified rgb color', function () {
        return setPixel(0, 0, 248, 252, 248).then(() => {
            expect(getPixel(0, 0)).to.eventually.eql([248, 252, 248]);
            expect(getPixel(1, 0)).to.eventually.eql([0, 0, 0]);
        });
    });
    it('can take the rgb values as individual parameters', function () {
        return setPixel(1, 1, 8, 8, 8).then(() => {
            expect(getPixel(1, 1)).to.eventually.eql([8, 8, 8]);
        });
    });
    it('or a rgb array', function () {
        return setPixel(1, 1, [16, 16, 16]).then(() => {
            expect(getPixel(1, 1)).to.eventually.eql([16, 16, 16]);
        });
    });
});

describe('getPixel', function () {
    before(function () {
        return clear(8, 16, 24);
    });
    it('returns the rgb array of the supplied x,y pixel', function () {
        return expect(getPixel(4, 4)).to.eventually.eql([8, 16, 24]);
    });
});

describe('setPixels', function () {
    it('sets the led matrix to the suppled RGB array ', function () {
        return setPixels(L).then(() =>
            expect(getPixels()).to.eventually.eql(L)
        );
    });
    it('sets the led matrix to the suppled RGB array', function () {
        return setPixels(black).then(() =>
            expect(getPixels()).to.eventually.eql(black)
        );
    });
});

describe('getPixels', function () {
    before(function () {
        return clear(16, 24, 8);
    });
    it("returns a promise of the matrix's leds as an RGB array", function () {
        return expect(getPixels()).to.eventually.eql(new Array(64).fill([16, 24, 8]));
    });
});

describe('clear', function () {
    it("sets all matrix's leds the supplied RGB color", function () {
        return clear([8, 16, 24]).then(() =>
            expect(getPixels()).to.eventually.eql(new Array(64).fill([8, 16, 24]))
        );
    });
    it("defualts to black/off", function () {
        return clear().then(() =>
            expect(getPixels()).to.eventually.eql(new Array(64).fill([0, 0, 0]))
        );
    });
});

describe('flipH', function () {
    before(function () {
        return setPixels(L);
    });

    it('mirrors the led matrix on the horizontal axis', function () {
        return flipH().then(() =>
            expect(getPixels()).to.eventually.eql(
                [_, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 x, x, x, x, x, x, x, x]
            )
        );
    });
});


describe('flipV', function () {
    it('mirrors the led matrix on the vertical axis', function () {
        return flipV().then(() =>
            expect(getPixels()).to.eventually.eql(
                [x, x, x, x, x, x, x, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x,
                 _, _, _, _, _, _, _, x]
            )
        );
    });
});


describe('loadImage', function () {
    it('reads a png file returns a promise of a pixel array', function () {
        const G = [60, 255, 0];
        return expect(loadImage('./test/space_invader.png'))
            .to.eventually.eql(
             [_, _, _, G, G, _, _, _,
              _, _, G, G, G, G, _, _,
              _, G, G, G, G, G, G, _,
              G, G, _, G, G, _, G, G,
              G, G, G, G, G, G, G, G,
              _, _, G, _, _, G, _, _,
              _, G, _, G, G, _, G, _,
              G, _, G, _, _, G, _, G]
            );
    });

    it('sends the pixel array to the led matrix', function () {
        const G = [56, 252, 0];
        return expect(getPixels()).to.eventually.eql(
             [_, _, _, G, G, _, _, _,
              _, _, G, G, G, G, _, _,
              _, G, G, G, G, G, G, _,
              G, G, _, G, G, _, G, G,
              G, G, G, G, G, G, G, G,
              _, _, G, _, _, G, _, _,
              _, G, _, G, G, _, G, _,
              G, _, G, _, _, G, _, G]
        );
    });
});


describe('showLetter', function () {
    before(function () {
        return showLetter('a');
    });
    it('displays the supplied letter on the led matrix', function () {
        return expect(getPixels()).to.eventually.eql(
               [_, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, _, x, x, x, _, _, _,
                _, _, _, _, _, x, _, _,
                _, _, x, x, x, x, _, _,
                _, x, _, _, _, x, _, _,
                _, _, x, x, x, x, _, _]);
    });
});

clear();

describe('flashMessage', function () {
    before(function () {
        return flashMessage('cba', 0.01);
    });
    it('shows the supplied string on the led matrix one letter at a time', function () {
        return expect(getPixels()).to.eventually.eql(
               [_, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, _, x, x, x, _, _, _,
                _, _, _, _, _, x, _, _,
                _, _, x, x, x, x, _, _,
                _, x, _, _, _, x, _, _,
                _, _, x, x, x, x, _, _]);
    });
});

describe('showMessage', function () {
    before(function () {
        return showMessage('cba', 0.01);
    });
    it('scrolls the supplied string on the led matrix', function () {
        return expect(getPixels()).to.eventually.eql(
              [_, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, _, _, _, _, _, _, _,
                _, x, x, x, _, _, _, _,
                _, _, _, _, x, _, _, _,
                _, x, x, x, x, _, _, _,
                x, _, _, _, x, _, _, _,
                _, x, x, x, x, _, _, _]);
    });
});
