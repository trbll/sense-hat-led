'use strict';

const expect = require('chai').expect;

const {
    setAngle,
    getAngle,
    checkAngle,
    pos,
} = require('../rotation.js');

describe('setAngle', function () {
    it('sets the rotation to the specified angle', function () {
        setAngle(90);
        expect (getAngle()).to.equal(90);
    });
});

describe('getAngle', function () {
    it('returns the current rotation', function () {
        setAngle(180);
        expect (getAngle()).to.equal(180);
    });
});

describe('checkAngle', function () {
    it('only allows rotation t0 be set to 0, 90, 180 or 270', function () {
        expect (checkAngle(90)).to.equal(90);
        expect (checkAngle(-90)).to.equal(270);
        expect (checkAngle(520)).to.equal(180);
        expect (checkAngle('b')).to.equal(180);
    });
});


describe('pos', function () {
    it('Maps a pixel array index into rotated position', function () {
        setAngle(0);
        expect (pos(0)).to.equal(0);
        expect (pos(63)).to.equal(63);
        expect (pos(1)).to.equal(1);
        setAngle(90);
        expect (pos(0)).to.equal(56);
        expect (pos(63)).to.equal(7);
        expect (pos(1)).to.equal(48);
        setAngle(270);
        expect (pos(0)).to.equal(7);
        expect (pos(63)).to.equal(56);
        expect (pos(1)).to.equal(15);
        setAngle(180);
        expect (pos(0)).to.equal(63);
        expect (pos(63)).to.equal(0);
        expect (pos(1)).to.equal(62);
    });
});