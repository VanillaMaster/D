import { serial } from "/assets/shared/serial.js"
import { message } from "/assets/shared/message.js"
import { worker } from "../serviceworker.js";

import * as RPC from "./entries.js";

/**
 * @callback request
 * @param { any } payload
 * @param { Transferable[] } [transfer]
 * @returns { Promise<any> }
 * 
 * @callback notify
 * @param { any } payload
 * @param { Transferable[] } [transfer]
 * @returns { void }
 */

/**
 * @returns { never }
 */
function __placeholder() {
    throw new Error("unexpected call in non-secure context");
}

export const [
    request,
    notify
] = /**@type { [request, notify] } */ (worker === null ? [__placeholder, __placeholder] :
(function(worker){
    const sequence = serial();
    const pendingRequests = new Map();

    /**@type { request } */
    function request(payload, transfer) {
        const { value: identifier } = sequence.next();
        const promise = new Promise((resolve) => {
            pendingRequests.set(identifier, resolve);
        });
        worker.postMessage([message.REQUEST, payload, identifier], /**@type { any } */(transfer));
        return promise;
    }

    /**@type { notify } */
    function notify(payload, transfer) {
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

    /**
     * @param { MessageEvent<any> } e 
     */
    function onMessage (e) {
        const { data: [specifier, payload, identifier] } = e;
        switch (specifier) {
            case message.REQUEST: return void onRequest(payload, identifier);
            case message.RESPONSE: return void onResponse(payload, identifier);
            default: return void console.error(specifier);
        }
    }

    if (navigator.serviceWorker !== undefined) {
        navigator.serviceWorker.addEventListener("message", onMessage);
    }

    return [request, notify];

})(worker));