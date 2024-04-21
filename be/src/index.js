import Router from "find-my-way";
import { createServer } from "node:http"
import { handleStaticFile, handleStaticFiles } from "./handleStaticFiles.js";
import { assetsFolder, modulesFolder, port, workerPath } from "./config.js";
import { documentCachePath, modules, modulesCachePath } from "./cache.js";


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

router.get("/api/modules", function(req, res, params, store, query){
    if (query.name === undefined) {
        return void handleStaticFile(req, res, modulesCachePath);
    } else if (query.name in modules) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(modules[query.name]);
    } else {
        res.statusCode = 404;
        res.end();
    }
})

const server = createServer();
server.on("request", function(req, res) { router.lookup(req, res); })
server.listen(port);