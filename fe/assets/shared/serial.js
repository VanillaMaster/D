/**
 * @returns { Generator<number, void, void> }
 */
function* finiteSerial() {
    for (let serial = 0; serial < Number.MAX_SAFE_INTEGER; serial++) yield serial;
}
/**
 * @returns { Generator<number, never, void> }
 */
export function* serial() {
    while (true) yield* finiteSerial();
}
