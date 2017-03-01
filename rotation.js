'use strict';

let rotation = 0;

const getAngle = () => rotation;
const setAngle = deg => rotation = checkAngle(deg);


function checkAngle(r = 0) {
    if (r < 0) r += 360; // negative angle for counterclockwise rotation
    if (!(r % 90 === 0 && r >= 0 && r < 360)) {
        console.error('Rotation must be 0, 90, 180 or 270 degrees');
        return rotation;
    }
    return r;
}

const pixMap = {
    0: (x, y) => y * 8 + x,
    90: (x, y) => y + (7 - x) * 8,
    180: (x, y) => (7 - y) * 8 + 7 - x,
    270: (x, y) => 7 - y + x * 8
};


// Maps a pixel array index into rotated position
//
function pos(i) {
    if (i < 0 || i > 63) throw Error(`i=${i} violates 0 <= i <= 63`);
    return pixMap[rotation](i % 8, Math.floor(i / 8));
}

// Maps a pixel array x,y position into rotated position
//
function posXY(x,y) {
    if (x < 0 || x > 7) throw Error(`x=${x} violates 0 <= x <= 7`);
    if (y < 0 || y > 7) throw Error(`y=${y} violates 0 <= y <= 7`); 
    return pixMap[rotation](x,y);
}


module.exports = {
    setAngle,
    getAngle,
    checkAngle,
    pos,
    posXY
};
