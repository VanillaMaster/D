/**@import { Registry } from "./module.js" */
import { readFile, writeFile, mkdir } from "fs/promises";
import { cacheFolder, modulesFolder, rootpagePath } from "./config.js";
import { computeImportMap, listModules } from "./module.js";
import { render } from "./template.js";
import { v5, NameSpace_FILE, NameSpace_INDEX } from "./uuid/v5.js";
import { resolve } from "node:path";

export const modulesCacheFolder = resolve(cacheFolder, "modules");

await mkdir(modulesCacheFolder, { recursive: true });

export const modulesCacheIndex = resolve(modulesCacheFolder, v5(Buffer.from("modules"), NameSpace_INDEX));

export const documentCachePath = resolve(cacheFolder, "index.html");

{
    const modules = await listModules(modulesFolder);
    await writeFile(modulesCacheIndex, JSON.stringify(modules));
    await cacheModules(modules);

    const importmap = JSON.stringify(await computeImportMap(modules));
    const template = await readFile(rootpagePath, { encoding: "utf8"});
    const document = render(template, {
        importmap
    });
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
    for (const task of tasks) await task;
}