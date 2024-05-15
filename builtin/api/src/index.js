import { router } from "@builtin/backend/server"
import { modules } from "@builtin/module-walker/server"
import { CACHE_FOLDER, MODULES_FOLDER } from "@builtin/config/server"
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { NameSpace_FILE, NameSpace_INDEX, v5 } from "./uuid/v5.js";
import { cacheExtensions, cacheModules } from "./cache.js";
import { handleParametricResourceWrite, handleStaticRead } from "@builtin/staticfiles"
import { computeEditableList } from "./computeEditableList.js";
import { notAllowed } from "@builtin/backend/helpers";

const modulesCacheFolder = resolve(CACHE_FOLDER, "modules");
const extensionsCacheFolder = resolve(CACHE_FOLDER, "extensions");

const modulesCacheIndex = resolve(modulesCacheFolder, v5(Buffer.from("modules"), NameSpace_INDEX));
const extensionsCacheIndex = resolve(extensionsCacheFolder, v5(Buffer.from("extensions"), NameSpace_INDEX));

/**@type { Set<string> } */
const editable = new Set();

{
    await Promise.all([
        mkdir(modulesCacheFolder, { recursive: true }),
        mkdir(extensionsCacheFolder, { recursive: true })
    ]);

    const { registry, extensions } = await modules();
    
    for (const element of computeEditableList(registry)) editable.add(element)
    
    await Promise.all([
        writeFile(extensionsCacheIndex, JSON.stringify(extensions)),
        cacheExtensions(extensions, extensionsCacheFolder),
        
        writeFile(modulesCacheIndex, JSON.stringify(registry)),
        cacheModules(registry, modulesCacheFolder),
    ]);
}

router.get("/api/modules", function(req, res, params, store, { name }){
    if (name !== undefined) return void handleStaticRead(req, res, resolve(modulesCacheFolder, v5(Buffer.from(name), NameSpace_FILE)), "application/json");
    return void handleStaticRead(req, res, modulesCacheIndex, "application/json");
});

router.get("/api/extensions", function(req, res, params, store, { kind }) {
    if (kind !== undefined) return void handleStaticRead(req, res, resolve(extensionsCacheFolder, v5(Buffer.from(kind), NameSpace_FILE)), "application/json");
    return void handleStaticRead(req, res, extensionsCacheIndex, "application/json");
})

router.put("/modules/*", function(req, res, params, store, search) {
    if (!editable.has(/**@type { string } */(req.url))) return void notAllowed(res);
    return void handleParametricResourceWrite(req, res, /**@type { { "*": string } } */ (params), MODULES_FOLDER);
})