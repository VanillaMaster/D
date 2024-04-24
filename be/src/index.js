/**@import { IncomingMessage, ServerResponse } from "node:http" */
import Router from "find-my-way";
import { createServer } from "node:http"
import { handleStaticFile, handleStaticFiles, handleStaticResource } from "./handleStaticFiles.js";
import { assetsFolder, modulesFolder, port, workerPath } from "./config.js";
import { documentCachePath, modulesCacheFolder, modulesCacheIndex } from "./cache.js";
import { NameSpace_FILE, v5 } from "./uuid/v5.js";
import { resolve } from "node:path";
import { handleRPC } from "@builtin/rpc/server";

const router = Router({
    defaultRoute(req, res){
        res.statusCode = 404;
        res.end();
    }
});

router.get("/", function(req, res) {
    handleStaticFile(req, res, documentCachePath);
});

router.get("/modules/*", function(req, res, params){
    handleStaticFiles(req, res, /**@type { { "*": string } } */ (params), modulesFolder);
})

router.get("/assets/*", function(req, res, params){
    handleStaticFiles(req, res, /**@type { { "*": string } } */ (params), assetsFolder);
})

router.get("/worker", function(req, res){
    handleStaticFile(req, res, workerPath);
});

router.get("/api/modules", function(req, res, params, store, { name }){
    if (name !== undefined) return void handleStaticResource(req, res, resolve(modulesCacheFolder, v5(Buffer.from(name), NameSpace_FILE)), "application/json");
    return void handleStaticResource(req, res, modulesCacheIndex, "application/json");
});

router.post("/api/rpc", function(req, res) {
    return void handleRPC(req, res);
})


const server = createServer();
server.on("request", function(req, res) { router.lookup(req, res); })
server.listen(port);