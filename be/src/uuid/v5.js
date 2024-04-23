import { createHash } from "node:crypto";
import stringify from "./stringify.js";

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