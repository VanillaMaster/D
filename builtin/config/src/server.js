import { cwd } from "node:process"
import { resolve } from "node:path"
import { readFile } from "fs/promises";
import { mkdir } from "node:fs/promises";

export const ROOT = cwd();

export const [
    PORT,
    IGNORED_MODULES,
    IGNORED_EXTENSIONS,
    MODULES_FOLDER,
    CACHE_FOLDER
] = (/**@param { backend.Config } config */function(config){ return /**@type { const } */ ([
    config.port,
    config.modules.ignore ?? [],
    config.extensions.ignore ?? [],
    resolve(ROOT, config.modules.path),
    resolve(ROOT, config.cache.path),
])})(await readFile(resolve(ROOT, "config.json")).then(JSON.parse));

await mkdir(CACHE_FOLDER, { recursive: true });