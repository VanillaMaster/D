import { message } from "/assets/shared/message.js";
import { serial } from "/assets/shared/serial.js";

import * as RPC from "./entries.js";

/**@type { ServiceWorkerGlobalScope } */
const self = /**@type {*}*/ (globalThis.self);

const sequence = serial();
const pendingRequests = new Map();

/**
 * @param { string } clientId 
 * @param { any } payload 
 * @param { Transferable[] } [transfer] 
 */
export async function request(clientId, payload, transfer) {
    const client = await self.clients.get(clientId);
    if (client == undefined) throw new Error();
    const { value: identifier } = sequence.next();
    const promise = new Promise((resolve) => {
        pendingRequests.set(identifier, resolve);
    });
    client.postMessage([message.REQUEST, payload, identifier], /**@type { any } */(transfer));
    return promise;
}
/**
 * @param { string } clientId 
 * @param { any } payload 
 * @param { Transferable[] } transfer 
 */
export async function notify(clientId, payload, transfer) {
    const client = await self.clients.get(clientId);
    if (client == undefined) throw new Error();
    client.postMessage([message.REQUEST, payload], /**@type { any } */(transfer));
}

/**
 * @param { Client | MessagePort | ServiceWorker } source 
 * @param { any } payload 
 * @param { number } [identifier] 
 */
async function onRequest(source, payload, identifier) {
    const [name, ...data] = payload;
    if (name in RPC && typeof /**@type { any }*/(RPC)[name] === "function") {
        const res = await /**@type { any }*/(RPC)[name](...data);
        if (identifier !== undefined) source.postMessage([message.RESPONSE, res, identifier]);
    } else {
        console.error(name, data);
    }
}
/**
 * @param { Client | MessagePort | ServiceWorker } source 
 * @param { any } payload 
 * @param { number } [identifier] 
 */
function onResponse(source, payload, identifier) {
    const resolve = pendingRequests.get(identifier);
    if (resolve === undefined) return void console.error(payload, identifier);
    resolve(payload);
}

self.addEventListener("message", function(e){
    const { data: [specifier, payload, identifier], source } = e;
    if (source == null) throw new Error();

    switch (specifier) {
        case message.REQUEST:
            onRequest(source, payload, identifier);
            break;
        case message.RESPONSE:
            onResponse(source, payload, identifier);
            break;
        default:
            console.error(specifier);
            break;
    }
})