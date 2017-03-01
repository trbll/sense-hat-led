const { pos } = require('./rotation.js');

const pixelsToBuffer = pixels => pixels.reduce(
    (buffer, rgb, index) => {
        buffer.writeUInt16LE(pack(rgb), 2 * pos(index));
        return buffer;
    }, Buffer.alloc(128)); // 8 x 8 pixels x 2 bytes


// Two bytes per pixel in fb memory, 16 bit RGB565
const bufferToPixels = buffer => Array.from({ length: 64 },
    (_, index) => unpack(buffer.readUInt16LE(2 * pos(index))));


const pixelToBuffer = rgb => {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(pack(rgb), 0);
    return buffer;
};

const bufferToPixel = buffer => unpack(buffer.readUInt16LE(0));


// Decodes 16 bit RGB565 into array [R,G,B]
//
function unpack(n) {
    const r = (n & 0xF800) >> 11;
    const g = (n & 0x7E0) >> 5;
    const b = n & 0x1F;
    return [r << 3, g << 2, b << 3];
}


// Encodes array [R, G, B] into 16 bit RGB565
//
function pack(rgb) {
    const r = rgb[0] >> 3 & 0x1F;
    const g = rgb[1] >> 2 & 0x3F;
    const b = rgb[2] >> 3 & 0x1F;
    return (r << 11) + (g << 5) + b;
}

module.exports = {
    pixelsToBuffer,
    bufferToPixels,
    pixelToBuffer,
    bufferToPixel,
    unpack,
    pack
};