/**@import { Registry } from "./module.js" */
import { readFile, writeFile, mkdir } from "fs/promises";
import { cacheFolder, modulesFolder, rootpagePath } from "./config.js";
import { computeImportMap, listModules } from "./module.js";
// import { render } from "./template.js";
import { v5, NameSpace_FILE, NameSpace_INDEX } from "./uuid/v5.js";
import { resolve } from "node:path";
import { listExtensions, list as extensionsList } from "./extension.js";
import mustache from "mustache";

export const modulesCacheFolder = resolve(cacheFolder, "modules");
export const extensionsCacheFolder = resolve(cacheFolder, "extensions");

await Promise.all([
    mkdir(modulesCacheFolder, { recursive: true }),
    mkdir(extensionsCacheFolder, { recursive: true })
]);

// await mkdir(modulesCacheFolder, { recursive: true });

export const modulesCacheIndex = resolve(modulesCacheFolder, v5(Buffer.from("modules"), NameSpace_INDEX));
export const extensionsCacheIndex = resolve(extensionsCacheFolder, v5(Buffer.from("extensions"), NameSpace_INDEX));

export const documentCachePath = resolve(cacheFolder, "index.html");

{
    const modules = await listModules(modulesFolder);
    const extensions = listExtensions(modules);

    extensionsList.push(
        ...Object.keys(extensions).filter(extension => extensions[extension].includes("server"))
    );
    
    await Promise.all([
        writeFile(extensionsCacheIndex, JSON.stringify(extensions)),
        cacheExtensions(extensions),
        
        writeFile(modulesCacheIndex, JSON.stringify(modules)),
        cacheModules(modules),

        cacheDocument(modules)
    ]);
}

/**
 * @param { Registry } modules 
 */
async function cacheDocument(modules) {
    const template = await readFile(rootpagePath, { encoding: "utf8"});
    const importmap = JSON.stringify(computeImportMap(modules));
    /**@type { string[] } */
    const prefetch = [];
    for (const module in modules) {
        const { prefetch: localPrefetch } = modules[module];
        if (localPrefetch !== undefined) prefetch.push(...localPrefetch);
    }

    const document = mustache.render(template, { importmap, prefetch });
    await writeFile(documentCachePath, document);
}

/**
 * @param { Registry } modules 
 */
async function cacheModules(modules) {
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
 * @param { Record<string, string[]> } extensions 
 */
async function cacheExtensions(extensions) {
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