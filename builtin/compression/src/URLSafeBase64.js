/**
 * urlsafe alphabet
 * @type { readonly string[]}
 */
const ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '-', '_'
];

/**
 * urlsafe alphabet map
 * charocde of alphabet symbol is index for ALPHABET_MAP to get its value
 * unpresented chars filled with 0
 * @type { readonly number[]}
 */
const ALPHABET_MAP = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x3e, 0x00, 0x00,
    0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
    0x3c, 0x3d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0x00, 0x00, 0x00, 0x00, 0x3f,
    0x00, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
    0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30,
    0x31, 0x32, 0x33
];

/**
 * @param { number } length 
 * @param { number } off 
 * @returns { number }
 */
function getEncodeBufferLength(length, off) {
    switch (off) {
        case 0: return (length / 3 * 4);
        case 1: return (length / 3 * 4) + 2;
        case 2: return (length / 3 * 4) + 3;
    }
    throw new RangeError();
}

/**
 * @param { Uint8Array } byts 
 */
export function encode(byts) {
    const off = byts.length % 3;
    const length = byts.length - off;
    const bufferLength = getEncodeBufferLength(length, off);
    const buffer = new Array(bufferLength);

    let i = 0, j = 0;
    while (i < length) {
        // 24-bit slice
        const slice = (byts[i++] << 0x10) | (byts[i++] << 0x08) | (byts[i++]);
        const b1 = (slice & 0b111111000000000000000000) >> 0x12;
        const b2 = (slice & 0b000000111111000000000000) >> 0x0C;
        const b3 = (slice & 0b000000000000111111000000) >> 0x06;
        const b4 = (slice & 0b000000000000000000111111);
        buffer[j++] = ALPHABET[b1];
        buffer[j++] = ALPHABET[b2];
        buffer[j++] = ALPHABET[b3];
        buffer[j++] = ALPHABET[b4];
    }
    switch (off) {
        case 1: {
            // 12-bit slice + 12-(low)bit padding
            const slice = (byts[i] << 0x04);
            const b1 = (slice & 0b111111000000) >> 0x06;
            const b2 = (slice & 0b000000111111);
            buffer[j] = ALPHABET[b1];
            buffer[j + 1] = ALPHABET[b2];
        } break;
        case 2: {
            // 18-bit slice + 6-(low)bit padding
            const slice = (byts[i] << 0x0A) | (byts[i + 1] << 0x02);
            const b1 = (slice & 0b111111000000000000) >> 0x0C;
            const b2 = (slice & 0b000000111111000000) >> 0x06;
            const b3 = (slice & 0b000000000000111111);
            buffer[j] = ALPHABET[b1];
            buffer[j + 1] = ALPHABET[b2];
            buffer[j + 2] = ALPHABET[b3];
        } break;
    }
    return buffer.join("");
}

/**
 * @param { number } length 
 * @param { number } off 
 * @returns { number }
 */
function getDecodeBufferLength(length, off) {
    switch (off) {
        case 0: return (length / 4 * 3);
        case 2: return (length / 4 * 3) + 1;
        case 3: return (length / 4 * 3) + 2;
    }
    throw new RangeError();
}

/**
 * @param { string } data 
 */
export function decode(data) {
    const off = data.length % 4;
    const length = data.length - off;
    const bufferLength = getDecodeBufferLength(length, off);
    const buffer = new Uint8Array(bufferLength);

    let i = 0, j = 0;
    while (i < length) {
        // 24-bit slice
        const slice = (
            ALPHABET_MAP[data.charCodeAt(i++)] << 0x12 |
            ALPHABET_MAP[data.charCodeAt(i++)] << 0x0C |
            ALPHABET_MAP[data.charCodeAt(i++)] << 0x06 |
            ALPHABET_MAP[data.charCodeAt(i++)]
        );
        buffer[j++] = (slice/* & 0xFF0000*/) >> 0x10;
        buffer[j++] = (slice & 0x00FF00) >> 0x08;
        buffer[j++] = (slice & 0x0000FF);
    }
    switch (off) {
        case 2: {
            const slice = (
                ALPHABET_MAP[data.charCodeAt(i)] << 0x12 |
                ALPHABET_MAP[data.charCodeAt(i + 1)] << 0x0C
            );
            buffer[j] = (slice/* & 0xFF0000*/) >> 0x10;
            buffer[j + 1] = (slice & 0x00FF00) >> 0x08;
        } break;
        case 3: {
            const slice = (
                ALPHABET_MAP[data.charCodeAt(i)] << 0x12 |
                ALPHABET_MAP[data.charCodeAt(i + 1)] << 0x0C |
                ALPHABET_MAP[data.charCodeAt(i + 2)] << 0x06 
            );
            buffer[j++] = (slice/* & 0xFF0000*/) >> 0x10;
            buffer[j++] = (slice & 0x00FF00) >> 0x08;
            buffer[j++] = (slice & 0x0000FF);
        } break;
    }
    return buffer;
}