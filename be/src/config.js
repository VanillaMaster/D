import { readFile } from "fs/promises";
import { getModuleRoot } from "./module.js";

export const root = getModuleRoot(import.meta.url);

/**@type { Config } */
const config = await readFile(new URL("config.json", root)).then(JSON.parse);

export const modulesFolder = new URL(config.modules, root);
export const assetsFolder = new URL(config.assets, root);
export const cacheFolder = new URL(config.cache, root);
export const workerPath = new URL(config.worker, root);
export const rootpagePath = new URL(config.rootpage, root);

export const port = config.port;