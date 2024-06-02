/**@type { readonly number[] } */
const ALPHABET = [
    0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50,
    0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
    0x59, 0x5a, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66,
    0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e,
    0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76,
    0x77, 0x78, 0x79, 0x7a, 0x30, 0x31, 0x32, 0x33,
    0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x2d, 0x5f
]
/**@type { readonly number[] } */
const ALPHABET_LOOKUP = [
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
 * Creates a url safe base64-encoded ASCII string from a binary data
 * 
 * ```js
 * const text = "Hello, world";
 * const encoder = new TextEncoder();
 * const bytes = encoder.encode(text);
 * const encoded = encode(bytes);
 * ```
 * 
 * @param { Uint8Array } bytes Data to encode
 * @returns { string } An ASCII string containing the url safe base64 representation of bytes
 */
export function encode(bytes) {
    const off = bytes.length % 3;
    const length = bytes.length - off;
    const bufferLength = getEncodeBufferLength(length, off);
    /**@type { number[] } */
    const buffer = new Array(bufferLength);

    let i = 0, j = 0;
    while (i < length) {
        // 24-bit slice (24 data)
        const slice = (bytes[i++] << 0x10) | (bytes[i++] << 0x08) | (bytes[i++]);
        const b1 = slice >> 0x12;
        const b2 = slice >> 0x0C & 0b111111;
        const b3 = slice >> 0x06 & 0b111111;
        const b4 = slice & 0b111111;
        buffer[j++] = ALPHABET[b1];
        buffer[j++] = ALPHABET[b2];
        buffer[j++] = ALPHABET[b3];
        buffer[j++] = ALPHABET[b4];
    }
    switch (off) {
        case 1: {
            // 12-bit slice (8 data + 4 pad)
            const slice = (bytes[i] << 0x04);
            const b1 = slice >> 0x06;
            const b2 = slice & 0b111111;
            buffer[j] = ALPHABET[b1];
            buffer[j + 1] = ALPHABET[b2];
        } break;
        case 2: {
            // 18-bit slice (16 data + 2 pad)
            const slice = (bytes[i] << 0x0A) | (bytes[i + 1] << 0x02);
            const b1 = slice >> 0x0C;
            const b2 = slice >> 0x06 & 0b111111;
            const b3 = slice & 0b111111;
            buffer[j] = ALPHABET[b1];
            buffer[j + 1] = ALPHABET[b2];
            buffer[j + 2] = ALPHABET[b3];
        } break;
    }
    return String.fromCharCode(...buffer);
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
 * Creates a binary data from a url safe base64-encoded ASCII string
 * 
 * ```js
 * const encoded = "SGVsbG8sIHdvcmxk";
 * const bytes = decode(data);
 * const decoder = new TextDecoder();
 * const text = decoder.decode(bytes);
 * ```
 * 
 * @param { string } data An ASCII string containing the url safe base64 representation of bytes
 * @returns { Uint8Array } Decoded bytes
 */
export function decode(data) {
    const off = data.length % 4;
    const length = data.length - off;
    const bufferLength = getDecodeBufferLength(length, off);
    const buffer = new Uint8Array(bufferLength);

    let i = 0, j = 0;
    while (i < length) {
        // 24-bit slice (24 data)
        const slice = (
            ALPHABET_LOOKUP[data.charCodeAt(i++)] << 0x12 |
            ALPHABET_LOOKUP[data.charCodeAt(i++)] << 0x0C |
            ALPHABET_LOOKUP[data.charCodeAt(i++)] << 0x06 |
            ALPHABET_LOOKUP[data.charCodeAt(i++)]
        );
        buffer[j++] = slice >> 0x10;
        buffer[j++] = slice >> 0x08 & 0xFF;
        buffer[j++] = slice & 0xFF;
    }
    switch (off) {
        case 2: {
            // 16-bit slice (12 data + 4 pad)
            const slice = (
                ALPHABET_LOOKUP[data.charCodeAt(i)] << 0x0A |
                ALPHABET_LOOKUP[data.charCodeAt(i + 1)] << 0x04
            );
            buffer[j] = slice >> 0x08;
            buffer[j + 1] = slice & 0xFF;
        } break;
        case 3: {
            const slice = (
                // 24-bit slice (18 data + 6 pad)
                ALPHABET_LOOKUP[data.charCodeAt(i)] << 0x12 |
                ALPHABET_LOOKUP[data.charCodeAt(i + 1)] << 0x0C |
                ALPHABET_LOOKUP[data.charCodeAt(i + 2)] << 0x06 
            );
            buffer[j++] = slice >> 0x10;
            buffer[j++] = slice >> 0x08 & 0xFF;
            buffer[j++] = slice & 0xFF;
        } break;
    }
    return buffer;
}