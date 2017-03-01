'use strict';

const ioctl = require('ioctl');

// ioctl codes
const senseHatFBIOGetGamma = 61696;
const senseHatFBIOSetGamma = 61697;
const senseHatFBIOResetGamma = 61698;
const senseHatFbGammaDefault = 0;
const senseHatFbGammaLow = 1;


module.exports = function (fd) {
  return {

    get gamma() {
      const buffer = Buffer.alloc(32);
      ioctl(fd, senseHatFBIOGetGamma, buffer);
      return Array.from(buffer.values());
    },


    set gamma(GammaArray) {
      try {
        if (!Array.isArray(GammaArray) || GammaArray.length != 32) throw Error('Gamma array must be of length 32');
        if (!GammaArray.every(v => v >= 0 && v <= 31)) throw Error('Gamma values must be between 0 and 31');
      } catch (error) {
        return console.error(error.message);
      }
      ioctl(fd, senseHatFBIOSetGamma, Buffer.from(GammaArray));
    },


    // Resets the LED matrix gamma correction to default
    gammaReset() {
      ioctl(fd, senseHatFBIOResetGamma, senseHatFbGammaDefault);
    },


    get lowLight() {
      const lowLigthGamma = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10];
      return this.gamma.evey((value, index) => value === lowLigthGamma[index]);
    },


    set lowLight(bol) {
      const cmd = bol ? senseHatFbGammaLow : senseHatFbGammaDefault;
      ioctl(fd, senseHatFBIOResetGamma, cmd);
    }


  };
};
