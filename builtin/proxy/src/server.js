/**@import { ClientRequest, IncomingMessage, ServerResponse, RequestOptions } from "node:http" */
import { router } from "@builtin/backend/server";
import { decode } from "@builtin/compression/URLSafeBase64"
import { request } from "node:https"

const RESPONSE = Symbol("response");

/**
 * @typedef { { [RESPONSE]: ServerResponse } } MetaRequest
 */

router.all("/api/proxy", function(req, res, params, store, { url }) {
    const decoder = new TextDecoder();
    const buffer = decode(url);
    const { hostname, pathname } = new URL(decoder.decode(buffer));
    const { method, headers } = req;
    
    req.headers.host = hostname;
    req.headers.referer = hostname;

    /**@type { ClientRequest & Partial<MetaRequest> } */
    const proxyReq = request(/**@type { RequestOptions }*/({
        headers,
        method,
        hostname,
        path: pathname
    }), requestCallBack);
    proxyReq[RESPONSE] = res;
    req.pipe(proxyReq);
})

/**
 * @this { ClientRequest & MetaRequest }
 * @param { IncomingMessage } proxyRes 
 */
function requestCallBack(proxyRes) {
    const { [RESPONSE]: response } = this;
    response.writeHead(/**@type { number } */(proxyRes.statusCode), proxyRes.headers)
    proxyRes.pipe(response);
}