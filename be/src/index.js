import Router from "find-my-way";
import { createServer } from "node:http";
import { port } from "./config.js";
import { list as extensionsList } from "./extension.js";

export const router = Router({
    defaultRoute(req, res){
        res.statusCode = 404;
        res.end();
    }
});

// router.get("/", function(req, res) {
//     handleStaticFileRead(req, res, documentCachePath);
// });

// router.get("/modules/*", function(req, res, params){
//     handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), modulesFolder);
// })
// router.put("/modules/*", function(req, res, params, store, search) {
//     if (!editable.has(/**@type { string } */(req.url))) return void notAllowed(res);
//     return void handleParametricResourceWrite(req, res, /**@type { { "*": string } } */ (params), modulesFolder);
// })

// router.get("/assets/*", function(req, res, params){
//     handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), assetsFolder);
// })

// router.get("/worker", function(req, res){
//     handleStaticFileRead(req, res, workerPath);
// });

// router.get("/api/modules", function(req, res, params, store, { name }){
//     if (name !== undefined) return void handleStaticRead(req, res, resolve(modulesCacheFolder, v5(Buffer.from(name), NameSpace_FILE)), "application/json");
//     return void handleStaticRead(req, res, modulesCacheIndex, "application/json");
// });

// router.get("/api/extensions", function(req, res, params, store, { kind }) {
//     if (kind !== undefined) return void handleStaticRead(req, res, resolve(extensionsCacheFolder, v5(Buffer.from(kind), NameSpace_FILE)), "application/json");
//     return void handleStaticRead(req, res, extensionsCacheIndex, "application/json");
// })

export const server = createServer();
server.on("request", function(req, res) {
    // console.log(req.url);
    router.lookup(req, res);
});

import { extensions } from "@builtin/module-walker/server"

(function(extensions){
    Promise.all(
        Object.keys(extensions)
            .filter(extension => extensions[extension].includes("server"))
            .map(extension => import(`${extension}/server`))
    ).then(function(){
        server.listen(port);
        console.log(port);
    }).catch(function(e) {
        console.error(e);
    });
    
})(await extensions())