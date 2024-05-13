import { encode } from "@builtin/compression/URLSafeBase64"

const encoder = new TextEncoder();

/**
 * @param { string | URL | Request } input 
 * @param { RequestInit } [init] 
 */
function fetchAny(input, init) {
    if (input instanceof Request) return fetchRequest(input, init);
    return fetchString(String(input), init);
}
export { fetchAny as fetch }
/**
 * @param { string } input 
 * @param { RequestInit } [init] 
 */
function fetchString(input, init) {
    const buffer = encoder.encode(input);
    const encoded = encode(buffer);
    const url = new URL("/api/proxy", location.origin);
    url.searchParams.set("url", encoded);
    return fetch(url, init);
}
/**
 * @param { globalThis.Request } input 
 * @param { RequestInit } [init] 
 */
function fetchRequest(input, init) {
    const buffer = encoder.encode(input.url);
    const encoded = encode(buffer);
    const url = new URL("/api/proxy", location.origin);
    url.searchParams.set("url", encoded);
    return fetch(new Request(url.toString() , {...input}), init);
}
