import { readFile } from "fs/promises";
import { getModuleRoot } from "./module.js";
import { resolve } from "node:path"

export const root = getModuleRoot(import.meta.url);

export const [
    ignoredModules,
    ignoredExtensions,
    modulesFolder,
    // assetsFolder,
    cacheFolder,
    // workerPath,
    rootpagePath,

    port
] = (/**@param { backend.Config } config */function(config){ return /**@type { const } */ ([
    //config can be gc'ed
    config.modules.ignore ?? [],
    config.extensions.ignore ?? [],
    resolve(root, config.modules.path),
    // resolve(root, config.assets.path),
    resolve(root, config.cache.path),
    // resolve(root, config.worker.path),
    resolve(root, config.rootpage.path),
    config.port
]);})(await readFile(resolve(root, "config.json")).then(JSON.parse));