const fs = require('fs');
const glob = require('glob');
const path = require('path');

module.exports = function () {
  try {
    return path.join('dev',
      path.basename(
        glob.sync('/sys/class/graphics/fb*')
        .filter(framebuffer => fs.existsSync(path.join(framebuffer, 'name')))
        .find(
          framebuffer => fs.readFileSync(path.join(framebuffer, 'name'))
          .toString().trim() === 'RPi-Sense FB'
        )
      )
    );
  } catch (error) {
    console.error(`Cannot detect RPi-Sense FB device`);
    return undefined;
  }
};