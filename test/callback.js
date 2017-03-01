'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const fd = fs.openSync('./test_fb', 'w+');

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
} = require('../callback_fb.js')(fd);

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
    before(function(done) {
        clear(done);
    });
    it('sets specified x, y pixel to the specified rgb color', function(done) {
        setPixel(0, 0, 248, 252, 248, (err) => {
            if (err) return done(err);
            console.log('set');
            getPixels((err, pixels) => {
                console.log('get');
                expect(pixels[0]).to.eql([248, 252, 248]);
                expect(pixels[1]).to.eql([0, 0, 0]);
                done(err);
            });
        });
    });

    it('can take the rgb values as individual parameters or a rgb array', function(done) {
        setPixel(1, 0, [16, 16, 16], () => {
            getPixels((err, pixels) => {
                expect(pixels[1]).to.eql([16, 16, 16]);
                done(err);
            });
        });
    });
});

describe('getPixel', function() {
    before(function(done) {
        clear(8, 16, 24, done);
    });

    it('returns the rgb array of the supplied x,y pixel', function(done) {
        getPixel(4, 4, (err, pixel) => {
            expect(pixel).to.eql([8, 16, 24]);
            done(err);
        });
    });
});

describe('setPixels', function() {
    it('sets the led matrix to the suppled RGB array', function(done) {
        setPixels(L, err =>
            (err) ?
            done(err) :
            getPixels((err, pixels) => {
                expect(pixels).to.eql(L);
                done(err);
            })
        );
    });
    it('sets the led matrix to the suppled RGB array', function(done) {
        setPixels(black, err =>
            (err) ?
            done(err) :
            getPixels((err, pixels) => {
                expect(pixels).to.eql(black);
                done(err);
            })
        );
    });
});


describe('getPixels', function() {
    before(function(done) {
        clear(8, 16, 24, done);
    });
    it("returns the matrix's leds as an RGB array", function(done) {
        getPixels((err, pixels) => {
            expect(pixels).to.eql(new Array(64).fill([8, 16, 24]));
            done(err);
        });
    });
});


describe('clear', function() {
    it("sets all matrix's leds the supplied RGB color", function(done) {
        clear(24, 8, 16, err => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(new Array(64).fill([24, 8, 16]));
                done(err);
            });
        });
    });
    it("defaults to black/off", function(done) {
        clear(err => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(new Array(64).fill([0, 0, 0]));
                done(err);
            });
        });
    });
});


describe('flipH', function() {
    before(function(done) {
        setPixels(L, done);
    });
    it('mirrors the led matrix on the horizontal axis', function(done) {
        flipH((err, flipped) => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(
                    [_, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     x, x, x, x, x, x, x, x]
                );
                expect(pixels).to.eql(flipped);
                done(err);
            });
        });
    });
});


describe('flipV', function() {
    it('mirrors the led matrix on the vertical axis', function(done) {
        flipV((err, flipped) => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(
                    [x, x, x, x, x, x, x, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x,
                     _, _, _, _, _, _, _, x]
                );
                expect(pixels).to.eql(flipped);
                done(err);
            });
        });
    });
});

describe('loadImage', function() {
    it('reads a png file returns converts it to a pixel array', function(done) {
        loadImage('./test/space_invader.png', true, (err, pixels) => {
            const G = [60, 255, 0];
            expect(pixels).to.eql(
                [_, _, _, G, G, _, _, _,
                 _, _, G, G, G, G, _, _,
                 _, G, G, G, G, G, G, _,
                 G, G, _, G, G, _, G, G,
                 G, G, G, G, G, G, G, G,
                 _, _, G, _, _, G, _, _,
                 _, G, _, G, G, _, G, _,
                 G, _, G, _, _, G, _, G]
            );
            done(err);
        });
    });
    it('sends the pixel array to the led matrix', function(done) {
        getPixels((err, pixels) => {
            const G = [56, 252, 0];
            expect(pixels).to.eql(
                [_, _, _, G, G, _, _, _,
                 _, _, G, G, G, G, _, _,
                 _, G, G, G, G, G, G, _,
                 G, G, _, G, G, _, G, G,
                 G, G, G, G, G, G, G, G,
                 _, _, G, _, _, G, _, _,
                 _, G, _, G, G, _, G, _,
                 G, _, G, _, _, G, _, G]
            );
            done(err);
        });
    });
});


describe('showLetter', function() {
    it('displays the supplied letter on the led matrix', function(done) {
        showLetter('a', err => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(
                    [_, _, _, _, _, _, _, _,
                     _, _, _, _, _, _, _, _,
                     _, _, _, _, _, _, _, _,
                     _, _, x, x, x, _, _, _,
                     _, _, _, _, _, x, _, _,
                     _, _, x, x, x, x, _, _,
                     _, x, _, _, _, x, _, _,
                     _, _, x, x, x, x, _, _]
                );
                done(err);
            });
        });
    });
});


describe('flashMessage', function() {
    it('shows the supplied string on the led matrix one letter at a time', function(done) {
        flashMessage('cba', 0.01, err => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(
                    [_, _, _, _, _, _, _, _,
                     _, _, _, _, _, _, _, _,
                     _, _, _, _, _, _, _, _,
                     _, _, x, x, x, _, _, _,
                     _, _, _, _, _, x, _, _,
                     _, _, x, x, x, x, _, _,
                     _, x, _, _, _, x, _, _,
                     _, _, x, x, x, x, _, _]
                );
                done(err);
            });
        });
    });
});


describe('showMessage', function() {
    it('scrolls the supplied string on the led matrix', function(done) {
        showMessage('cba', 0.01, err => {
            if (err) return done(err);
            getPixels((err, pixels) => {
                expect(pixels).to.eql(
                  [_, _, _, _, _, _, _, _,
                    _, _, _, _, _, _, _, _,
                    _, _, _, _, _, _, _, _,
                    _, x, x, x, _, _, _, _,
                    _, _, _, _, x, _, _, _,
                    _, x, x, x, x, _, _, _,
                    x, _, _, _, x, _, _, _,
                    _, x, x, x, x, _, _, _]
                );
                done(err);
            });
        });
    });
});
