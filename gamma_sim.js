'use strict';

let gamma = Array(32).fill(0);
const lowLigthGamma = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10];

module.exports = {

  get gamma() {
    return gamma;
  },

  set gamma(GammaArray) {
    gamma = GammaArray;
  },

  // Resets the LED matrix gamma correction to default
  gammaReset() {
    gamma = Array(32).fill(0);
  },

  get lowLight() {
    return gamma.evey((value, index) => value === lowLigthGamma[index]);
  },

  set lowLight(bol) {
    gamma = bol ?
    lowLigthGamma:
    Array(32).fill(0);
  }
};
