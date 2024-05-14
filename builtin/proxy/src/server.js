/**@import { ClientRequest, IncomingMessage, ServerResponse, RequestOptions } from "node:http" */
import { router } from "@builtin/backend/server";
import { request as requestUnsafe } from "node:https"
import { pipeline } from "node:stream";

const RESPONSE = Symbol("response");

/**
 * @param { ServerResponse } res 
 * @param { string } [msg] 
 */
export function internalServerError(res, msg) {
    res.statusCode = 500;
    if (msg !== undefined) res.statusMessage = msg;
    res.end();
}

/**
 * @param { ServerResponse } res 
 */
function unprocessableEntity(res) {
    res.statusCode = 422;
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
    pipeline(proxyRes, response, /**@param { NodeJS.ErrnoException | null } err */function(err) {
        if (err != null) return void internalServerError(response, err.code);
    })
}

/**
 * @typedef { { [RESPONSE]: ServerResponse } } MetaRequest
 */

router.all("/api/proxy", function(req, res) {
    const { method, headers: originalHeaders } = req;
    /**@type { Record<string, string | string[]> } */
    const headers = {};
    /**@type { unknown } */
    let url;
    for (const name in originalHeaders) {
        if (name.startsWith("override-")) {
            if (name == "override-url") url = originalHeaders[name];
            continue;
        }
        headers[name] = /**@type { string | string[] }*/(originalHeaders[name]);
    }
    if (typeof url !== "string") return unprocessableEntity(res);
    const { hostname, host, pathname: path, error } = parseURL(url);
    if (error) return unprocessableEntity(res);
    headers.host = host;

    for (const originalName in originalHeaders) {
        if (!originalName.startsWith("override-")) continue;
        const name = originalName.substring(9);
        if (name == "url") continue;

        headers[name] = /**@type { string | string[] }*/(originalHeaders[originalName]);
    }

    const proxyReq = request({ headers, method, hostname, path }, res);
    if (proxyReq == null) return void internalServerError(res);
    pipeline(req, proxyReq, /**@param { NodeJS.ErrnoException | null } err */function(err) {
        if (err != null) return void internalServerError(res, err.code);
    })
})