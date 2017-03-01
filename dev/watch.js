'use strict';
const fb = './fb-file';

const fs = require('fs');
const {
  getPixels
} = require('./sync.js')(fb);
var cursor = require('ansi')(process.stdout);

fs.watch(fb, redraw);

cursor.reset().goto(1, 1).hide();

module.exports = (eventType, filename) => {
  getPixels()
    .forEach((pixel, i) => {
      cursor
        .goto((i % 8) * 2 + 1, Math.floor(i / 8) + 1)
        .bg.rgb(...pixel)
        .write('  ')
        .bg.reset();
        
    });
}

// ctx.clear();
// ctx.bg(0,0,0);
// ctx.box(0,0,16,8);
// ctx.cursor.restore();


// function redraw(eventType, filename) {
//   getPixels((err, pixelArray) => {
//     if (err) return console.error(err.message);
//     //console.log('w');
//     pixelArray.forEach((pixel, i) => {
//       ctx.bg(...pixel);
//       const x = (i % 8) + 1;
//       const y = Math.floor(i / 8) + 1;
//       ctx.box(x * 2 - 1, y, 2, 1);
//     });
//     ctx.cursor.restore();
//   });
// }
