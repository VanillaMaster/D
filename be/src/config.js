import { readFile } from "fs/promises";
import { getModuleRoot } from "./module.js";
import { resolve } from "node:path"

export const root = getModuleRoot(import.meta.url);

/**@type { Config } */
const config = await readFile(resolve(root, "config.json")).then(JSON.parse);

export const ignoredModules = config.modules.ignore;
export const modulesFolder = resolve(root, config.modules.path)//= new URL(config.modules, root);
export const assetsFolder = resolve(root, config.assets.path)//new URL(config.assets, root);
export const cacheFolder = resolve(root, config.cache.path)//new URL(config.cache, root);
export const workerPath = resolve(root, config.worker.path)//new URL(config.worker, root);
export const rootpagePath = resolve(root, config.rootpage.path)//new URL(config.rootpage, root);

export const port = config.port;