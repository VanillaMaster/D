import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NameSpace_FILE, v5 } from "./uuid/v5.js";

/**
 * @param { backend.Registry } modules 
 * @param { string } modulesCacheFolder 
 */
export async function cacheModules(modules, modulesCacheFolder) {
    /**@type { Promise<void>[] } */
    const tasks = [];
    for (const module in modules) {
        const name = v5(Buffer.from(module), NameSpace_FILE);
        const path = resolve(modulesCacheFolder, name);
        tasks.push(writeFile(path, JSON.stringify(modules[module])));
    }
    await Promise.all(tasks);
}

/**
 * @param { backend.Extensions } extensions 
 * @param { string } extensionsCacheFolder 
 */
export async function cacheExtensions(extensions, extensionsCacheFolder) {
    const kinds = new Set(Object.values(extensions).flat());
    /**@type { Promise<void>[] } */
    const tasks = [];
    for (const kind of kinds.keys()) {
        const name = v5(Buffer.from(kind), NameSpace_FILE);
        const path = resolve(extensionsCacheFolder, name);
        /**@type { Record<string, string[]> } */
        const matchingExtensions = {};
        for (const extension in extensions) {
            const kinds = extensions[extension];
            if (kinds.includes(kind)) matchingExtensions[extension] = kinds;
        }
        tasks.push(writeFile(path, JSON.stringify(matchingExtensions)));
    }
    await Promise.all(tasks);
}