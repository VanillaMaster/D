import { cwd } from "node:process"
import { resolve } from "node:path"
import { mkdir, readFile } from "node:fs/promises";

export const ROOT = cwd();

/**
 * @typedef Config
 * @property { object } modules
 * @property { string } modules.path
 * @property { readonly string[] } [modules.ignore]
 * @property { object } extensions
 * @property { readonly string[] } [extensions.ignore]
 * @property { object } cache
 * @property { string } cache.path
 * @property { number } port
 */

export const [
    PORT,
    IGNORED_MODULES,
    IGNORED_EXTENSIONS,
    MODULES_FOLDER,
    CACHE_FOLDER
] = (/**@param { Config } config */function(config){ return /**@type { const } */ ([
    config.port,
    config.modules.ignore ?? [],
    config.extensions.ignore ?? [],
    resolve(ROOT, config.modules.path),
    resolve(ROOT, config.cache.path),
])})(await readFile(resolve(ROOT, "config.json")).then(JSON.parse));

await mkdir(CACHE_FOLDER, { recursive: true });