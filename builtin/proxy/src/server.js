/**@import { ClientRequest, IncomingMessage, ServerResponse, RequestOptions } from "node:http" */
import { router } from "@builtin/backend/server";
import { internalServerError, unprocessableEntity } from "@builtin/backend/helpers";
import { request as requestUnsafe } from "node:https"
import { pipeline } from "node:stream";
import { decode } from "@builtin/compression/base64url";

const RESPONSE = Symbol("response");

const TEXT_DECODER = new TextDecoder("utf-8");

/**
 * @param { string } url 
 */
function parseURL(url) {
    try {
        return /**@type { URL & { error?: undefined } } */ (new URL(url));
    } catch (error) {
        return /**@type { { [K in keyof URL]: undefined } & { error: Error } } */ ({
            error
        })
    }
}

/**
 * @param { RequestOptions | string | URL } options 
 * @param { ServerResponse } response 
 * @returns 
 */
function request(options, response) {
    try {
        /**@type { ClientRequest & Partial<MetaRequest> } */
        const request = requestUnsafe(options, requestCallBack);
        request[RESPONSE] = response;
        return request;
    } catch (error) {
        return null;
    }
}
/**
 * @this { ClientRequest & MetaRequest }
 * @param { IncomingMessage } proxyRes 
 */
function requestCallBack(proxyRes) {
    const { [RESPONSE]: response } = this;
    response.writeHead(/**@type { number } */(proxyRes.statusCode), proxyRes.headers)
    pipeline(proxyRes, response, /**@param { NodeJS.ErrnoException | null } err */function(err) {
        if (err != null) return void internalServerError(response, err.code);
    })
}

/**
 * @typedef { { [RESPONSE]: ServerResponse } } MetaRequest
 */

router.all("/api/proxy", function(req, res) {
    const { method, headers: originalHeaders } = req;
    const headers = new Headers(/**@type {Record<String, string>} */(originalHeaders));
    const rawxheaders = headers.get("x-headers");
    const rawxurl = headers.get("x-url");
    headers.delete("x-headers");
    headers.delete("x-url");
    if (rawxurl == null || rawxheaders == null) return void unprocessableEntity(res);
    const headersByts = decode(rawxheaders)
    const urlBytes = decode(rawxurl)

    const xheaders = JSON.parse(TEXT_DECODER.decode(headersByts));
    const xurl = TEXT_DECODER.decode(urlBytes);

    for (const [key, value] of Object.entries(xheaders)) {
        headers.set(key, value);
    }

    const { hostname, pathname: path, error } = parseURL(xurl);
    if (error) return unprocessableEntity(res);

    const proxyReq = request({
        headers: Object.fromEntries(headers.entries()),
        method,
        hostname,
        path
    }, res);

    if (proxyReq == null) return void internalServerError(res);
    return void pipeline(req, proxyReq, /**@param { NodeJS.ErrnoException | null } err */function(err) {
        if (err != null) return void internalServerError(res, err.code);
    });

})