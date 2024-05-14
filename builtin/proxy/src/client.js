const FORBIDDEN_HEADER_NAMES = new Set([
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "date",
    "dnt",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "permissions-policy",
    // "proxy-",
    // "sec-",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via"
]);

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
function fetchString(input, init = {}) {

    if (init.headers !== undefined) {
        init.headers = updateHeaders(init.headers);
        init.headers.set("override-url", input);
    } else init.headers = { "override-url": input };

    return fetch("/api/proxy", init);
}
/**
 * @param { globalThis.Request } input 
 * @param { RequestInit } [init] 
 */
function fetchRequest(input, init = {}) {
    const headers = updateHeaders(input.headers);
    if (init.headers !== undefined) {
        init.headers = updateHeaders(init.headers);
        init.headers.set("override-url", input.url);
    } else init.headers = { "override-url": input.url };

    return fetch(new Request("/api/proxy" , {
        ...input,
        headers
    }), init);
}

/**
 * @param { HeadersInit } init 
 */
function updateHeaders(init) {
    const headers = new Headers();
    for (const [originalName, value] of new Headers(init).entries()) {
        const name = originalName.toLowerCase();
        if (
            FORBIDDEN_HEADER_NAMES.has(name) ||
            name.startsWith("proxy-") ||
            name.startsWith("sec-")
        ) {
            headers.set(`override-${name}`, value);
        } else {
            headers.set(name, value);
        }
    }
    return headers;
}