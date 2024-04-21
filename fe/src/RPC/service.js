import { serial } from "/assets/shared/serial.js"
import { message } from "/assets/shared/message.js"
import { worker } from "../serviceworker.js";

import * as RPC from "./entries.js";

const sequence = serial();
const pendingRequests = new Map();

/**
 * @param { any } payload
 * @param { Transferable[] } [transfer]
 * @returns { Promise<any> }
 */
export function request(payload, transfer) {
    const { value: identifier } = sequence.next();
    const promise = new Promise((resolve) => {
        pendingRequests.set(identifier, resolve);
    });
    worker.postMessage([message.REQUEST, payload, identifier], /**@type { any } */(transfer));
    return promise;
}
/**
 * @param { any } payload
 * @param { Transferable[] } [transfer]
 */
export function notify(payload, transfer) {
    worker.postMessage([message.REQUEST, payload], /**@type { any } */(transfer));
}

/**
 * @private
 * @param { any } payload
 * @param { number } identifier
 */
async function onRequest(payload, identifier) {
    const [name, ...data] = payload;
    if (name in RPC && typeof /**@type { any }*/(RPC)[name] === "function") {
        const res = await /**@type { any }*/(RPC)[name](...data);
        if (identifier !== undefined) worker.postMessage([message.RESPONSE, res, identifier]);
    } else {
        console.error(name, data);
    }
}

/**
 * @private
 * @param { any } payload
 * @param { number } identifier
 */
function onResponse(payload, identifier) {
    const resolve = pendingRequests.get(identifier);
    if (resolve === undefined) return void console.error(payload, identifier);
    resolve(payload);
}

navigator.serviceWorker.addEventListener("message", (e) => {
    const { data: [specifier, payload, identifier] } = e;
    switch (specifier) {
        case message.REQUEST:
            onRequest(payload, identifier);
            break;
        case message.RESPONSE:
            onResponse(payload, identifier);
            break;
        default:
            console.error(specifier);
            break;
    }
});