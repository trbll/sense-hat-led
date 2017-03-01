'use strict';
var cursor = require('ansi')(process.stdout);
var util = require('util');

const paint = pixels => {
  pixels
    .forEach((pixel, i) => cursor
      .bg.rgb(...pixel)
      .write((i % 8 === 0) ? '\n  ' : '  ')
      .bg.reset());
  console.log('\n');
};

const log = pixels => console.log('\[\n  ' + pixels.map(rgb =>
    '[' + rgb.map(value =>
      ' '.repeat(3 - value.toString().length) + util.inspect(value, { colors: true })
    ).join(', ') + ']'
  )
  .reduce((acc, value, index, arr) =>
    (index % 8 === 0) ?
    acc.concat(arr.slice(index, index + 7).join(', ')) :
    acc, [])
  .join(',\n  ') + '\n]');

module.exports = { paint, log };
