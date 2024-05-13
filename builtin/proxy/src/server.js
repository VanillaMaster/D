/**@import { ClientRequest, IncomingMessage, ServerResponse, RequestOptions } from "node:http" */
import { router } from "@builtin/backend/server";
import { decode } from "@builtin/compression/URLSafeBase64"
import { request as requestUnsafe } from "node:https"

const RESPONSE = Symbol("response");

const decoder = new TextDecoder();

/**
 * @param { ServerResponse } res 
 */
export function internalServerError(res) {
    res.statusCode = 500;
    res.end();
}

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
    proxyRes.pipe(response);
}

/**
 * @typedef { { [RESPONSE]: ServerResponse } } MetaRequest
 */

router.all("/api/proxy", function(req, res, params, store, { url }) {
    const buffer = decode(url);
    const deocdedURL = decoder.decode(buffer);
    const { method, headers } = req;

    const { hostname, pathname: path, error } = parseURL(deocdedURL);
    if (error) return internalServerError(res);
    
    req.headers.host = hostname;
    req.headers.referer = hostname;
    
    const proxyReq = request({ headers, method, hostname, path }, res);
    if (proxyReq == null) return void internalServerError(res);

    req.pipe(proxyReq);
})