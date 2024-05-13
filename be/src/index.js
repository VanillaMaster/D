/**@import { IncomingMessage, ServerResponse } from "node:http" */
import Router from "find-my-way";
import { createServer } from "node:http"
import { handleStaticFileRead, handleParametricFileRead, handleStaticRead, handleParametricResourceWrite, internalServerError, notAllowed } from "./handleStaticFiles.js";
import { assetsFolder, modulesFolder, port, workerPath } from "./config.js";
import { documentCachePath, editable, extensionsCacheFolder, extensionsCacheIndex, modulesCacheFolder, modulesCacheIndex } from "./cache.js";
import { NameSpace_FILE, v5 } from "./uuid/v5.js";
import { resolve } from "node:path";
import { list as extensionsList } from "./extension.js";

export const router = Router({
    defaultRoute(req, res){
        res.statusCode = 404;
        res.end();
    }
});

router.get("/", function(req, res) {
    handleStaticFileRead(req, res, documentCachePath);
});

router.get("/modules/*", function(req, res, params){
    handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), modulesFolder);
})
router.put("/modules/*", function(req, res, params, store, search) {
    if (!editable.has(/**@type { string } */(req.url))) return void notAllowed(res);
    return void handleParametricResourceWrite(req, res, /**@type { { "*": string } } */ (params), modulesFolder);
})

router.get("/assets/*", function(req, res, params){
    handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), assetsFolder);
})

router.get("/worker", function(req, res){
    handleStaticFileRead(req, res, workerPath);
});

router.get("/api/modules", function(req, res, params, store, { name }){
    if (name !== undefined) return void handleStaticRead(req, res, resolve(modulesCacheFolder, v5(Buffer.from(name), NameSpace_FILE)), "application/json");
    return void handleStaticRead(req, res, modulesCacheIndex, "application/json");
});

router.get("/api/extensions", function(req, res, params, store, { kind }) {
    if (kind !== undefined) return void handleStaticRead(req, res, resolve(extensionsCacheFolder, v5(Buffer.from(kind), NameSpace_FILE)), "application/json");
    return void handleStaticRead(req, res, extensionsCacheIndex, "application/json");
})

import { request } from "node:https"
import { decode } from "@builtin/compression/URLSafeBase64"
router.all("/api/proxy", function(req, res, params, store, { url }) {
    const decoder = new TextDecoder();
    const buffer = decode(url);
    const { hostname, pathname } = new URL(decoder.decode(buffer));
    const { method, headers } = req;
    
    req.headers.host = hostname;
    req.headers.referer = hostname;

    const proxyReq = request(/**@type { import("node:http").RequestOptions }*/({
        headers,
        method,
        hostname,
        path: pathname
    }), function(proxyRes) {
        res.writeHead(/**@type { number } */(proxyRes.statusCode), proxyRes.headers)
        proxyRes.pipe(res)
    })
    req.pipe(proxyReq);
})


export const server = createServer();
server.on("request", function(req, res) { router.lookup(req, res); });

Promise.all(extensionsList.map(extension => import(`${extension}/server`))).then(function(){
    server.listen(port);
    console.log(port);
}).catch(function(e) {
    console.error(e);
});
