/**@import { JSONRPCRequest } from "json-rpc-2.0" */
import { JSONRPCClient } from "json-rpc-2.0"

const headers = new Headers({ "content-type": "application/json" });
const method = "POST";

/**
 * @param { JSONRPCRequest | JSONRPCRequest[] } payload 
 */
function isNotNotification(payload) {
    if (Array.isArray(payload)) return payload.some(hasId);
    return hasId(payload);
}
/**
 * @param { JSONRPCRequest } payload 
 */
function hasId(payload) {
    return payload.id !== undefined;
}

/**
 * @param { JSONRPCRequest | JSONRPCRequest[] } payload
 * @param { any } [clientParams]  
 */
async function sendRequest(payload, clientParams) {
    const response = await fetch("/api/rpc", {
        body: JSON.stringify(payload),
        method,
        headers
    });
    if (response.status === 200) {
        const jsonRPCResponse = await response.json();
        return void client.receive(jsonRPCResponse);
    }
    if (isNotNotification(payload)) throw new Error(response.statusText);
}

/**@type { JSONRPCClient } */
export const client = new JSONRPCClient(sendRequest);
