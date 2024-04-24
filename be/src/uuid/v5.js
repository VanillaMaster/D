import { createHash } from "node:crypto";
import stringify from "./stringify.js";

export const NameSpace_ZERO = new Uint8Array([
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

/**
 * "file" + zero-init namespace
 */
export const NameSpace_FILE = new Uint8Array([
    0xe1, 0x0b, 0x9e, 0x3f,
    0x02, 0xd3,
    0x5f, 0x27,
    0xa5, 0xd7, 0x54, 0xd2, 0x3e, 0x6c, 0xcd, 0xa2
]);

/**
 * "index" + zero-init namespace
 */
export const NameSpace_INDEX = new Uint8Array([
    0xbd, 0xd9, 0x80, 0xef,
    0xe2, 0xcd,
    0x5d, 0xf6,
    0x86, 0x6c, 0x9f, 0xb2, 0xf7, 0x89, 0xd1, 0x58
]);

/**
 * @param { Uint8Array } value
 * @param { Uint8Array } namespace
 * @returns { string }
 */
export function v5(value, namespace) {
    const bytes = new Uint8Array(value.byteLength + namespace.byteLength);
    bytes.set(namespace);
    bytes.set(value, namespace.length);

    const hash = createHash("sha1");
    hash.update(bytes);
    const buffer = hash.digest()

    buffer[6] = (buffer[6] & 0x0f) | 0x50;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    return stringify(buffer);
}