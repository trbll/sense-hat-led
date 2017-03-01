'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const fd = fs.openSync('./test/test_fb', 'w+');

const {
    sleep,
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
} = require('../sync_fb.js')(fd);

const {
    getAngle
} = require('../rotation.js');


describe('sleep', function() {
    it('blocks execution for specified number of seconds', function() {
        const start = new Date();
        sleep(0.1);
        const end = new Date();
        expect(end - start - 100).to.be.below(5);
    });
});

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

describe('setRotation', function() {
    it('sets the rotation and redisplays', function() {
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

describe('setPixel', function() {
    clear();
    it('sets specified x, y pixel to the specified rgb color', function() {
        setPixel(0, 0, 248, 252, 248);
        expect(getPixel(0, 0)).to.eql([248, 252, 248]);
        expect(getPixel(1, 0)).to.eql([0, 0, 0]);
    });
    it('can take the rgb values as individual parameters or a rgb array', function() {
        setPixel(1, 1, 8, 8, 8);
        expect(getPixel(1, 1)).to.eql([8, 8, 8]);
        setPixel(1, 1, [16, 16, 16]);
        expect(getPixel(1, 1)).to.eql([16, 16, 16]);
    });
});

describe('getPixel', function() {
    clear();
    it('returns the rgb array of the supplied x,y pixel', function() {
        clear(8, 16, 24);
        expect(getPixel(0, 0)).to.eql([8, 16, 24]);
        expect(getPixel(1, 0)).to.eql([8, 16, 24]);
    });
});

describe('setPixels', function() {
    it('sets the led matrix to the suppled RGB array', function() {
        setPixels(L);
        expect(getPixels()).to.eql(L);
        setPixels(black);
        expect(getPixels()).to.eql(black);
    });
});

describe('getPixels', function() {
    it("returns the matrix's leds as an RGB array", function() {
        clear(8, 16, 24);
        expect(getPixels()).to.eql(new Array(64).fill([8, 16, 24]));
    });
});

describe('clear', function() {
    it("sets all matrix's leds the supplied RGB color", function() {
        clear();
        expect(getPixels()).to.eql(new Array(64).fill([0, 0, 0]));
        clear([8, 16, 24]);
        expect(getPixels()).to.eql(new Array(64).fill([8, 16, 24]));
    });
});

describe('flipH', function() {
    it('mirrors the led matrix on the horizontal axis', function() {
        setPixels(L);
        flipH();
        expect(getPixels()).to.eql(
            [_, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             x, x, x, x, x, x, x, x]
        );
    });
});

describe('flipV', function() {
    it('mirrors the led matrix on the vertical axis', function() {
        flipV();
        expect(getPixels()).to.eql(
            [x, x, x, x, x, x, x, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x,
             _, _, _, _, _, _, _, x]
        );
    });
});

describe('loadImage', function() {
    it('reads a png file and sends it to the led matrix', function() {
        const G = [56, 252, 0];
        loadImage('./test/space_invader.png');
        expect(getPixels()).to.eql(
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

describe('showLetter', function() {
    it('displays the supplied letter on the led matrix', function() {
        showLetter('a');
        expect(getPixels()).to.eql(
            [_, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, _, x, x, x, _, _, _,
             _, _, _, _, _, x, _, _,
             _, _, x, x, x, x, _, _,
             _, x, _, _, _, x, _, _,
             _, _, x, x, x, x, _, _]
        );
    });
});

clear();

describe('flashMessage', function() {
    it('shows the supplied string on the led matrix one letter at a time', function() {
        flashMessage('cba', 0.01);
        expect(getPixels()).to.eql(
            [_, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, _, x, x, x, _, _, _,
             _, _, _, _, _, x, _, _,
             _, _, x, x, x, x, _, _,
             _, x, _, _, _, x, _, _,
             _, _, x, x, x, x, _, _]
        );
    });
});

describe('showMessage', function() {
    it('scrolls the supplied string on the led matrix', function() {
        showMessage('cba', 0.01);
        expect(getPixels()).to.eql(
            [_, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, _, _, _, _, _, _, _,
             _, x, x, x, _, _, _, _,
             _, _, _, _, x, _, _, _,
             _, x, x, x, x, _, _, _,
             x, _, _, _, x, _, _, _,
             _, x, x, x, x, _, _, _]
        );
    });
});
