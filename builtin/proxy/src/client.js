import { encode } from "@builtin/compression/base64url"

const TEXT_ENCODER = new TextEncoder();

/**
 * 
 * @param { string | URL | Request } input 
 * @param { RequestInit } [init] 
 * @returns { Promise<Response> }
 */
export function proxyFetch(input, init) {
    const request = new Request(input, init);
    const { url, headers: originalHeaders } = request;
    const headers = new Headers(originalHeaders);
    const { host } = new URL(url);
    headers.set("host", host);
    const encodedHeaders = encode(
        TEXT_ENCODER.encode(
            JSON.stringify(
                Object.fromEntries(
                    headers.entries()
                )
            )
        )
    );
    const encodedURL = encode(TEXT_ENCODER.encode(url));
    return fetch("/api/proxy", {
        ...request,
        headers: {
            "x-headers": encodedHeaders,
            "x-url": encodedURL
        }
    });
}

export { proxyFetch as fetch }