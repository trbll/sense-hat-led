'use strict';

const expect = require('chai').expect;
const sense = require('../index.js').sync;

sense.gammaReset();
sense.clear(255, 255, 255);


describe('lowLight', function () {
    it('Toggles the LED matrix low light mode', function () {
        console.log("lowLight: ", sense.lowLight);
        sense.lowLight = true;
        expect(sense.lowLight).to.equal(true);
        console.log(sense.gamma);
        sense.lowLight = false;
        expect(sense.lowLight).to.equal(false);
        console.log(sense.gamma);
    });
});

sense.clear(255, 127, 0);

describe('gamma', function () {
    it('Allows you to specify a gamma lookup table for the final 5 bits of colour', function () {
        expect(sense.gamma).to.eql([0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 18, 20, 21, 23, 25, 27, 29, 31]);
        sense.gamma = sense.gamma.reverse();
        expect(sense.gamma).to.eql([31, 29, 27, 25, 23, 21, 20, 18, 17, 15, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0]);
        sense.lowLight = true;
        expect(sense.gamma).to.eql([0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10]);
        sense.lowLight = false;
        sense.gamma = new Array(32).fill(0); // Will turn the LED matrix off
        expect(sense.gamma).to.eql(new Array(32).fill(0));
    });
});


describe('gammaReset', function () {
    it('Resets the gamma lookup table to default', function () {
        sense.gammaReset();
        console.log(sense.gamma);
        expect(sense.gamma).to.eql(0);
    });
});